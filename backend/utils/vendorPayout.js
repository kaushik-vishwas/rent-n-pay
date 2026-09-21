import {
  enrichProductWithListingTemplateVendorRents,
  findListingTemplateForProduct,
} from './listingTemplateVendorRent.js';

export const FALLBACK_COMMISSION_RATE = 15;

/** True when checkout stored a vendor payout rate on this line. */
export function hasSnapshottedVendorUnitRate(line) {
  const v = line?.vendorUnitRateAtOrder;
  return v !== null && v !== undefined && Number.isFinite(Number(v));
}

/** Resolve vendor unit rate at checkout; persisted on the order line. */
export async function resolveVendorUnitRateForOrderSnapshot(
  product,
  lineDraft,
  orderDraft,
) {
  if (!product) return 0;
  const plain =
    typeof product.toObject === 'function' ? product.toObject() : { ...product };

  const fromProduct = resolveVendorConfiguredUnitRate(
    { ...lineDraft, product: plain },
    orderDraft,
  );

  if (String(plain.createdVia || '') !== 'template') {
    return fromProduct;
  }

  const template = await findListingTemplateForProduct(plain);
  if (!template) return fromProduct;

  const enriched = enrichProductWithListingTemplateVendorRents(
    { ...plain },
    template,
  );
  const fromTemplate = resolveVendorConfiguredUnitRate(
    { ...lineDraft, product: enriched },
    orderDraft,
  );

  const templateAt = new Date(template.updatedAt || 0).getTime();
  const productAt = new Date(plain.updatedAt || 0).getTime();
  if (productAt > templateAt) return fromProduct;
  return fromTemplate;
}

export function vendorDisplayRate(line) {
  const pricePerDay = Number(line?.pricePerDay || 0);
  if (line?.offerSource === 'admin') {
    return Number(line?.originalPricePerDay ?? pricePerDay);
  }
  return pricePerDay;
}

export function buildCategoryRateMap(categories) {
  const list = Array.isArray(categories) ? categories : [];
  const map = {};
  list.forEach((c) => {
    if (!c?.name) return;
    map[c.name] = Number(c.commissionRate) || 0;
  });
  return map;
}

export function getCommissionRatePercent(line, categoryRateMap = {}) {
  const categoryName = line?.product?.category || '';
  if (categoryRateMap instanceof Map) {
    if (categoryName && categoryRateMap.has(categoryName)) {
      return Number(categoryRateMap.get(categoryName)) || 0;
    }
    return FALLBACK_COMMISSION_RATE;
  }
  if (
    categoryName &&
    Object.prototype.hasOwnProperty.call(categoryRateMap, categoryName)
  ) {
    return Number(categoryRateMap[categoryName]) || 0;
  }
  return FALLBACK_COMMISSION_RATE;
}

function positiveAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function resolveProductVariant(product, line) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (!variants.length) return null;
  const variantId = line?.variantId;
  const variantName = String(line?.variantName || '').trim();
  if (variantId) {
    const byId = variants.find((v) => String(v?._id || '') === String(variantId));
    if (byId) return byId;
  }
  if (variantName) {
    const byName = variants.find(
      (v) => String(v?.variantName || '').trim() === variantName,
    );
    if (byName) return byName;
  }
  if (variants.length === 1) return variants[0];
  return null;
}

function tierHasPricing(cfg) {
  return positiveAmount(cfg?.vendorRent || cfg?.customerRent || cfg?.pricePerDay) > 0;
}

function mergeRentalConfigTiers(configs) {
  const map = new Map();
  (configs || []).forEach((cfg) => {
    if (!cfg) return;
    const unit = String(cfg?.periodUnit || 'month').toLowerCase();
    const len =
      unit === 'day' ? Number(cfg?.days || 0) : Number(cfg?.months || 0);
    const key = `${unit}:${len}`;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { ...cfg });
      return;
    }
    map.set(key, {
      ...prev,
      ...cfg,
      vendorRent: positiveAmount(cfg?.vendorRent) || positiveAmount(prev?.vendorRent),
      customerRent:
        positiveAmount(cfg?.customerRent) ||
        positiveAmount(prev?.customerRent) ||
        positiveAmount(cfg?.pricePerDay) ||
        positiveAmount(prev?.pricePerDay),
      pricePerDay:
        positiveAmount(cfg?.pricePerDay) || positiveAmount(prev?.pricePerDay),
    });
  });
  return Array.from(map.values());
}

function collectRentalConfigs(product, line) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const variant = resolveProductVariant(product, line);
  const variantCfgs = Array.isArray(variant?.rentalConfigurations)
    ? variant.rentalConfigurations
    : [];
  const topCfgs = Array.isArray(product?.rentalConfigurations)
    ? product.rentalConfigurations
    : [];
  const fromAll = variants.flatMap((v) =>
    Array.isArray(v?.rentalConfigurations) ? v.rentalConfigurations : [],
  );

  const merged = mergeRentalConfigTiers([
    ...variantCfgs,
    ...topCfgs,
    ...fromAll,
  ]);
  if (merged.some(tierHasPricing)) return merged;
  if (variantCfgs.length) return variantCfgs;
  if (fromAll.length) return fromAll;
  return topCfgs;
}

function matchRentalConfig(configs, line) {
  if (!Array.isArray(configs) || !configs.length) return null;
  const duration = Number(line?.rentalDuration || 0);
  const unit = String(line?.tenureUnit || 'month').toLowerCase();
  const wantDay = unit === 'day';
  const pool = configs.filter((c) => {
    const pu = String(c?.periodUnit || 'month').toLowerCase();
    return wantDay ? pu === 'day' : pu !== 'day';
  });
  const list = pool.length ? pool : configs;

  if (duration > 0) {
    const exact = list.find((c) => {
      const len = wantDay ? Number(c?.days || 0) : Number(c?.months || 0);
      return len === duration;
    });
    if (exact) {
      if (positiveAmount(exact.vendorRent)) return exact;
      const vendorForTenure = list.find((c) => {
        const len = wantDay ? Number(c?.days || 0) : Number(c?.months || 0);
        return len === duration && positiveAmount(c?.vendorRent);
      });
      if (vendorForTenure) return vendorForTenure;
      return exact;
    }
  }

  const chargedRate = vendorDisplayRate(line);
  if (chargedRate > 0) {
    const byCharged = list.find((c) => {
      const customer = positiveAmount(c?.customerRent || c?.pricePerDay);
      return customer === chargedRate;
    });
    if (byCharged) return byCharged;
  }

  const withVendorRent = list.filter((c) => positiveAmount(c?.vendorRent));
  if (withVendorRent.length === 1) return withVendorRent[0];

  return (
    list.find((c) => positiveAmount(c?.vendorRent)) ||
    list.find((c) => positiveAmount(c?.customerRent || c?.pricePerDay)) ||
    list[0] ||
    null
  );
}

export function resolveLineRefundableDeposit(line, order = null) {
  const qty = Math.max(1, Number(line?.quantity || 1));
  const depLine = Number(line?.refundableDeposit);
  if (Number.isFinite(depLine) && depLine > 0) {
    return depLine;
  }

  const product = line?.product;
  if (product && typeof product === 'object') {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const variantId = line?.variantId;
    const variantName = String(line?.variantName || '').trim();
    let variant = null;
    if (variantId) {
      variant = variants.find((v) => String(v?._id || '') === String(variantId));
    }
    if (!variant && variantName) {
      variant = variants.find(
        (v) => String(v?.variantName || '').trim() === variantName,
      );
    }
    const variantDep = Number(variant?.refundableDeposit);
    if (Number.isFinite(variantDep) && variantDep > 0) {
      return variantDep * qty;
    }
    const productDep = Math.max(0, Number(product.refundableDeposit || 0)) * qty;
    if (productDep > 0) return productDep;
  }

  const orderDep = Math.max(0, Number(order?.refundableDeposit || 0));
  if (orderDep > 0) {
    const allLines = (order?.products || []).filter(
      (l) => l?.product && typeof l.product === 'object',
    );
    if (allLines.length <= 1) return orderDep;
    const lineValue =
      Number(line?.pricePerDay || 0) * Math.max(1, Number(line?.quantity || 1));
    const orderValue =
      allLines.reduce(
        (s, l) =>
          s +
          Number(l?.pricePerDay || 0) * Math.max(1, Number(l?.quantity || 1)),
        0,
      ) || 1;
    return Math.round(orderDep * (lineValue / orderValue));
  }

  return 0;
}

function lineWithOrderTenure(line, order = null) {
  const rentalDuration = Number(line?.rentalDuration);
  const originalDuration = Number(
    line?.originalRentalDuration ?? order?.originalRentalDuration,
  );
  const orderDuration = Number(order?.rentalDuration);
  const resolvedDuration =
    Number.isFinite(rentalDuration) && rentalDuration > 0
      ? rentalDuration
      : Number.isFinite(originalDuration) && originalDuration > 0
        ? originalDuration
        : Number.isFinite(orderDuration) && orderDuration > 0
          ? orderDuration
          : line?.rentalDuration;
  return {
    ...line,
    rentalDuration: resolvedDuration,
    tenureUnit: line?.tenureUnit || order?.tenureUnit || 'month',
  };
}

export function resolveVendorConfiguredUnitRate(line, order = null) {
  const product = line?.product;
  if (!product || typeof product === 'string') return 0;
  const tenureLine = lineWithOrderTenure(line, order);

  const isSell =
    String(tenureLine?.productType || product?.type || '').toLowerCase() ===
    'sell';
  if (isSell) {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const variant =
      variants.find(
        (v) => String(v?._id || '') === String(tenureLine?.variantId),
      ) ||
      variants.find(
        (v) =>
          String(v?.variantName || '').trim() ===
          String(tenureLine?.variantName || '').trim(),
      );
    const variantSell = positiveAmount(variant?.sellPrice);
    if (variantSell) return variantSell;
    if (String(product.createdVia || '') === 'manual') {
      return positiveAmount(product?.salesConfiguration?.salePrice);
    }
    return 0;
  }

  const cfg = matchRentalConfig(
    collectRentalConfigs(product, tenureLine),
    tenureLine,
  );
  return positiveAmount(cfg?.vendorRent);
}

export function resolveVendorOrderLineDisplayAmount(
  line,
  categoryRateMap = {},
  order = null,
) {
  // Vendor-facing total = configured/commission product amount + deposit.
  return computeVendorLineMoney(line, categoryRateMap, order).payout;
}

export function computeVendorLineMoney(line, categoryRateMap = {}, order = null) {
  const qty = Number(line?.quantity || 1);
  const deposit = resolveLineRefundableDeposit(line, order);
  // Option 2: use checkout snapshot when present; legacy lines never read live config.
  const configuredRate = hasSnapshottedVendorUnitRate(line)
    ? positiveAmount(Number(line.vendorUnitRateAtOrder))
    : 0;

  if (configuredRate > 0) {
    const productGross = configuredRate * qty;
    return {
      productGross,
      commission: 0,
      netProduct: productGross,
      deposit,
      payout: productGross + deposit,
      ratePercent: 0,
      usedVendorConfig: true,
    };
  }

  const productGross = vendorDisplayRate(line) * qty;
  const ratePercent = getCommissionRatePercent(line, categoryRateMap);
  const commission = Math.round(productGross * (ratePercent / 100));
  const netProduct = Math.max(0, productGross - commission);
  return {
    productGross,
    commission,
    netProduct,
    deposit,
    payout: netProduct + deposit,
    ratePercent,
    usedVendorConfig: false,
  };
}

export function computeVendorLinesPayout(lines, categoryRateMap = {}, order = null) {
  return (lines || []).reduce(
    (sum, line) =>
      sum + computeVendorLineMoney(line, categoryRateMap, order).payout,
    0,
  );
}
