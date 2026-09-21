import ServiceListingTemplate from '../../models/ServiceListingTemplate.js';
import { uploadImageToCloudinary } from '../../config/cloudinaryUpload.js';

const MAX_UPLOAD_FILES = 40;

const parseJsonField = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeLabelValueRows = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .map((r) => ({
      label: String(r?.label || '').trim(),
      value: String(r?.value || '').trim(),
    }))
    .filter((r) => r.label || r.value);

const normalizePricingTiers = (raw) =>
  (Array.isArray(raw) ? raw : []).map((cfg) => {
    const periodUnit = cfg?.periodUnit === 'day' ? 'day' : 'month';
    return {
      months: toNumber(cfg?.months, 0),
      days: toNumber(cfg?.days, 0),
      periodUnit,
      label: String(cfg?.label || '').trim(),
      tierLabel: String(cfg?.tierLabel || '').trim(),
      pricePerDay: toNumber(cfg?.pricePerDay, 0),
      customerRent: toNumber(cfg?.customerRent, 0),
      customerShipping: toNumber(cfg?.customerShipping, 0),
      vendorRent: toNumber(cfg?.vendorRent, 0),
      vendorShipping: toNumber(cfg?.vendorShipping, 0),
    };
  });

const normalizeVariants = (variantsRaw) => {
  const arr = Array.isArray(variantsRaw) ? variantsRaw : [];
  return arr.map((v) => ({
    variantName: String(v?.variantName || '').trim(),
    existingVariantImages: Array.isArray(v?.existingVariantImages)
      ? v.existingVariantImages.filter(Boolean)
      : [],
    variantSpecs: normalizeLabelValueRows(v?.variantSpecs),
    rentalPricingModel: v?.rentalPricingModel === 'day' ? 'day' : 'month',
    allowVendorEditRentalPrices:
      v?.allowVendorEditRentalPrices === false ||
      v?.allowVendorEditRentalPrices === 'false'
        ? false
        : true,
    rentalConfigurations: normalizePricingTiers(v?.rentalConfigurations),
    refundableDeposit: toNumber(v?.refundableDeposit, 0),
    price: String(v?.price || '').trim(),
    stock: toNumber(v?.stock, 0),
  }));
};

function splitServiceTemplateFiles(files) {
  const main = [];
  const byVariant = {};
  for (const f of files || []) {
    if (f.fieldname === 'images') {
      if (main.length < 10) main.push(f);
      continue;
    }
    const m = /^variantImages_(\d+)$/.exec(f.fieldname);
    if (m) {
      const idx = Number(m[1]);
      if (!byVariant[idx]) byVariant[idx] = [];
      if (byVariant[idx].length < 10) byVariant[idx].push(f);
    }
  }
  return { mainFiles: main, variantFilesByIndex: byVariant };
}

async function uploadMany(files, folder) {
  const urls = [];
  for (const file of files || []) {
    const imgRes = await uploadImageToCloudinary(file.buffer, folder);
    urls.push(imgRes.secure_url);
  }
  return urls;
}

async function mergeVariantImages(variant, files) {
  const uploaded = await uploadMany(files, 'service-listing-templates/variants');
  const kept = Array.isArray(variant.existingVariantImages)
    ? variant.existingVariantImages.filter(Boolean)
    : [];
  const merged = [...kept, ...uploaded].slice(0, 10);
  delete variant.existingVariantImages;
  variant.images = merged;
}

const normalizePayload = (body) => {
  const data = { ...body };
  data.type = 'Service';
  data.sku = String(body.sku || '').trim();
  if (
    body.isActive !== undefined &&
    body.isActive !== null &&
    body.isActive !== ''
  ) {
    data.isActive =
      body.isActive === true ||
      body.isActive === 'true' ||
      body.isActive === '1';
  }

  data.productCustomSpecs = normalizeLabelValueRows(
    parseJsonField(body.productCustomSpecs, []),
  );
  data.specifications = parseJsonField(body.specifications, {});
  data.variants = normalizeVariants(parseJsonField(body.variants, []));
  data.rentalConfigurations = normalizePricingTiers(
    parseJsonField(body.rentalConfigurations, []),
  );
  data.refundableDeposit = toNumber(body.refundableDeposit, 0);
  data.logisticsVerification = parseJsonField(body.logisticsVerification, {});
  data.salesConfiguration = parseJsonField(body.salesConfiguration, {});
  data.serviceMeta = parseJsonField(body.serviceMeta, {});
  data.existingImages = parseJsonField(body.existingImages, []);
  data.stock = toNumber(body.stock, 0);
  delete data.flexibleVariants;
  return data;
};

function resolveTemplateImage(data) {
  if (data.images?.length) {
    return data.images[0];
  }
  for (const v of data.variants || []) {
    if (v.images?.length) return v.images[0];
  }
  return '';
}

export const listServiceListingTemplates = async (req, res) => {
  try {
    const serviceListingTemplates = await ServiceListingTemplate.find().sort({
      updatedAt: -1,
    });
    res.json({ serviceListingTemplates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createServiceListingTemplate = async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length > MAX_UPLOAD_FILES) {
      return res.status(400).json({ message: 'Too many files uploaded' });
    }

    const { mainFiles, variantFilesByIndex } = splitServiceTemplateFiles(files);
    const data = normalizePayload(req.body);

    const mainUploaded = await uploadMany(mainFiles, 'service-listing-templates');
    if (mainUploaded.length > 0) {
      data.images = mainUploaded.slice(0, 10);
    } else if (Array.isArray(data.existingImages) && data.existingImages.length) {
      data.images = data.existingImages.filter(Boolean).slice(0, 10);
    } else {
      data.images = [];
    }

    for (let i = 0; i < data.variants.length; i++) {
      await mergeVariantImages(
        data.variants[i],
        variantFilesByIndex[i] || [],
      );
    }

    data.image = resolveTemplateImage(data);
    if (!data.image) {
      return res.status(400).json({
        message: 'Add at least one image on the listing or on a variant',
      });
    }

    delete data.existingImages;
    const serviceListingTemplate = await ServiceListingTemplate.create(data);

    res.status(201).json({
      message: 'Service listing template created',
      serviceListingTemplate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateServiceListingTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    if (files.length > MAX_UPLOAD_FILES) {
      return res.status(400).json({ message: 'Too many files uploaded' });
    }

    const existing = await ServiceListingTemplate.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ message: 'Service listing template not found' });
    }

    const { mainFiles, variantFilesByIndex } = splitServiceTemplateFiles(files);
    const data = normalizePayload(req.body);
    const mainUploaded = await uploadMany(mainFiles, 'service-listing-templates');

    const keptExistingImages = Array.isArray(data.existingImages)
      ? data.existingImages.filter(Boolean)
      : Array.isArray(existing.images)
        ? existing.images
        : existing.image
          ? [existing.image]
          : [];
    data.images = [...keptExistingImages, ...mainUploaded].slice(0, 10);

    for (let i = 0; i < data.variants.length; i++) {
      const incoming = data.variants[i];
      const prev = existing.variants?.[i];
      const hasIncoming =
        (incoming.existingVariantImages &&
          incoming.existingVariantImages.length > 0) ||
        (variantFilesByIndex[i] && variantFilesByIndex[i].length > 0);
      if (!hasIncoming && prev?.images?.length) {
        incoming.existingVariantImages = [...prev.images];
      }
    }

    for (let i = 0; i < data.variants.length; i++) {
      await mergeVariantImages(
        data.variants[i],
        variantFilesByIndex[i] || [],
      );
    }

    data.image = resolveTemplateImage(data);
    if (!data.image) {
      return res.status(400).json({
        message: 'At least one image is required (listing or variant)',
      });
    }

    delete data.existingImages;

    const serviceListingTemplate = await ServiceListingTemplate.findByIdAndUpdate(
      id,
      data,
      { new: true },
    );

    res.json({
      message: 'Service listing template updated',
      serviceListingTemplate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteServiceListingTemplate = async (req, res) => {
  try {
    const doc = await ServiceListingTemplate.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res
        .status(404)
        .json({ message: 'Service listing template not found' });
    }
    res.json({ message: 'Service listing template deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const patchServiceListingTemplateActive = async (req, res) => {
  try {
    const { id } = req.params;
    const isActive =
      req.body.isActive === true ||
      req.body.isActive === 'true' ||
      req.body.isActive === '1';
    const serviceListingTemplate = await ServiceListingTemplate.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
    if (!serviceListingTemplate) {
      return res
        .status(404)
        .json({ message: 'Service listing template not found' });
    }
    res.json({ serviceListingTemplate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
