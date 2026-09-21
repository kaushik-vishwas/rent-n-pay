import ListingTemplate from '../models/ListingTemplate.js';
import Product from '../models/Product.js';

function positiveAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function plainDoc(value) {
  if (!value || typeof value !== 'object') return value;
  if (typeof value.toObject === 'function') return value.toObject();
  if (value._doc && typeof value._doc === 'object') return { ...value._doc };
  return value;
}

function tierKey(cfg) {
  const unit = String(cfg?.periodUnit || 'month').toLowerCase();
  const len =
    unit === 'day' ? Number(cfg?.days || 0) : Number(cfg?.months || 0);
  return `${unit}:${len}`;
}

function collectTemplateTiers(template) {
  const top = Array.isArray(template?.rentalConfigurations)
    ? template.rentalConfigurations
    : [];
  const fromVariants = (Array.isArray(template?.variants) ? template.variants : [])
    .flatMap((v) =>
      Array.isArray(v?.rentalConfigurations) ? v.rentalConfigurations : [],
    );
  const map = new Map();
  [...top, ...fromVariants].forEach((raw) => {
    const cfg = plainDoc(raw);
    if (!cfg) return;
    const key = tierKey(cfg);
    const prev = map.get(key);
    const vendorRent = positiveAmount(cfg?.vendorRent);
    if (!prev) {
      map.set(key, { ...cfg, vendorRent });
      return;
    }
    map.set(key, {
      ...prev,
      ...cfg,
      vendorRent: vendorRent || positiveAmount(prev?.vendorRent),
    });
  });
  return map;
}

function mergeVendorRentsIntoTierList(tiers, templateTierMap) {
  if (!Array.isArray(tiers) || !templateTierMap?.size) return tiers;
  return tiers.map((raw) => {
    const cfg = plainDoc(raw);
    const key = tierKey(cfg);
    const fromTemplate = templateTierMap.get(key);
    // Listing template is the source of truth for this tenure, including 0.
    if (!fromTemplate) return cfg;
    return { ...cfg, vendorRent: positiveAmount(fromTemplate?.vendorRent) };
  });
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

function resolveTemplateVariant(template, line) {
  const variants = Array.isArray(template?.variants) ? template.variants : [];
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

export function resolveTemplateRefundableDeposit(template, line) {
  if (!template) return 0;
  const variant = resolveTemplateVariant(template, line);
  const variantDep = positiveAmount(variant?.refundableDeposit);
  if (variantDep) return variantDep;
  return positiveAmount(template?.refundableDeposit);
}

/** Merge admin listing-template refundableDeposit into a product snapshot (read path). */
export function enrichProductWithListingTemplateRefundableDeposit(
  product,
  template,
  line = null,
) {
  if (!product || typeof product !== 'object' || !template) return product;
  const fromTemplate = resolveTemplateRefundableDeposit(template, line);
  if (!fromTemplate) return product;

  if (!positiveAmount(product.refundableDeposit)) {
    product.refundableDeposit = fromTemplate;
  }

  const variant = resolveProductVariant(product, line);
  const templateVariant = resolveTemplateVariant(template, line);
  const variantDep = positiveAmount(templateVariant?.refundableDeposit);
  if (variant && variantDep && !positiveAmount(variant.refundableDeposit)) {
    variant.refundableDeposit = variantDep;
  }

  return product;
}

/** Merge admin listing-template vendorRent into a product snapshot (read path). */
export function enrichProductWithListingTemplateVendorRents(product, template) {
  if (!product || typeof product !== 'object' || !template) return product;
  const templateTierMap = collectTemplateTiers(template);
  if (!templateTierMap.size) return product;

  if (Array.isArray(product.rentalConfigurations)) {
    product.rentalConfigurations = mergeVendorRentsIntoTierList(
      product.rentalConfigurations,
      templateTierMap,
    );
  }
  if (Array.isArray(product.variants)) {
    product.variants = product.variants.map((variant) => {
      if (!variant || !Array.isArray(variant.rentalConfigurations)) {
        return variant;
      }
      return {
        ...variant,
        rentalConfigurations: mergeVendorRentsIntoTierList(
          variant.rentalConfigurations,
          templateTierMap,
        ),
      };
    });
  }
  return product;
}

function buildProductPatchFromTemplate(product, template) {
  const templateTierMap = collectTemplateTiers(template);
  if (!templateTierMap.size) return { changed: false, patch: {} };

  const patch = {};
  let changed = false;
  const productPlain = plainDoc(product);

  const nextTop = mergeVendorRentsIntoTierList(
    productPlain.rentalConfigurations || [],
    templateTierMap,
  );
  const prevTop = (productPlain.rentalConfigurations || []).map(plainDoc);
  if (JSON.stringify(nextTop) !== JSON.stringify(prevTop)) {
    patch.rentalConfigurations = nextTop;
    changed = true;
  }

  if (Array.isArray(productPlain.variants) && productPlain.variants.length) {
    let variantsChanged = false;
    const nextVariants = productPlain.variants.map((variant) => {
      const variantPlain = plainDoc(variant);
      const nextCfgs = mergeVendorRentsIntoTierList(
        variantPlain?.rentalConfigurations || [],
        templateTierMap,
      );
      const prevCfgs = (variantPlain?.rentalConfigurations || []).map(plainDoc);
      if (JSON.stringify(nextCfgs) !== JSON.stringify(prevCfgs)) {
        variantsChanged = true;
        return { ...variantPlain, rentalConfigurations: nextCfgs };
      }
      return variantPlain;
    });
    if (variantsChanged) {
      patch.variants = nextVariants;
      changed = true;
    }
  }

  return { changed, patch };
}

export async function syncVendorProductsFromListingTemplate(template) {
  if (!template?.productName) return { updated: 0 };

  const products = await Product.find({
    productName: template.productName,
    category: template.category,
    subCategory: template.subCategory,
    type: template.type,
    createdVia: 'template',
    isDeleted: { $ne: true },
  });

  let updated = 0;
  const templatePlain =
    typeof template?.toObject === 'function' ? template.toObject() : template;

  for (const product of products) {
    const { changed, patch } = buildProductPatchFromTemplate(
      product,
      templatePlain,
    );
    if (!changed) continue;
    await Product.updateOne({ _id: product._id }, { $set: patch });
    updated += 1;
  }
  return { updated };
}

export async function findListingTemplateForProduct(product) {
  if (!product?.productName) return null;

  return ListingTemplate.findOne({
    productName: product.productName,
    category: product.category,
    subCategory: product.subCategory,
    type: product.type,
    isActive: { $ne: false },
  })
    .sort({ updatedAt: -1 })
    .lean();
}

export async function enrichOrderProductsWithListingTemplateVendorRents(orders) {
  const list = Array.isArray(orders) ? orders : [orders];
  for (const order of list) {
    for (const line of order?.products || []) {
      const product = line?.product;
      if (!product || typeof product === 'string') continue;
      if (String(product.createdVia || '') !== 'template') continue;
      const template = await findListingTemplateForProduct(product);
      enrichProductWithListingTemplateVendorRents(product, template);
      enrichProductWithListingTemplateRefundableDeposit(product, template, line);
    }
  }
  return orders;
}
