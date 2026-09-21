'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../components/ProductCard';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import {
  apiGetStorefrontVendorProducts,
  apiGetPublicActiveOffers,
  apiGetMasterCategories,
  apiGetActiveBoosts,
} from '../lib/api';
import { api } from '../lib/axios';

import { getProductListPriceValue } from '@/lib/rentalPriceDisplay';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addToCart } from '../store/slices/cartSlice';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useToast } from '@/contexts/ToastContext';
import {
  apiRequestStockNotify,
  apiGetMyWishlist,
  apiToggleWishlist,
  apiGetProductById,
  apiGetServiceProducts,
} from '../lib/api';
import { getRentalListingAmount } from '@/lib/rentalPriceDisplay';

const PLATFORM_FEE_PERCENT = 15;
// Admin offers store a % of the platform fee removed; convert that into a
// plain % of product price so it can be used exactly like a vendor offer's
// discountPercent everywhere below.
function resolveDiscountPercent(offer) {
  if (!offer) return 0;
  if (offer.source === 'admin') {
    return Math.min(
      PLATFORM_FEE_PERCENT,
      Number(offer.platformFeeReductionPercent || 0),
    );
  }
  return Number(offer.discountPercent || 0);
}

const Products = () => {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const dispatch = useDispatch();
  const router = useRouter();
  const { openAuth } = useAuthModal();
  const { pushToast } = useToast();

  const [notifyingIds, setNotifyingIds] = useState(new Set());
  const [notifiedIds, setNotifiedIds] = useState(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem('rn_notified_product_ids');
      return new Set(JSON.parse(raw || '[]'));
    } catch {
      return new Set();
    }
  });
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categoriesMaster, setCategoriesMaster] = useState([]);
  const [offersByProduct, setOffersByProduct] = useState({});
  const [wishedIds, setWishedIds] = useState([]);
  const [togglingId, setTogglingId] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: '',
    subCategory: '',
    brand: '',
    type: '',
    availability: '',
    condition: 'All',
  });
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null); // full category object from master
  const [boostedProductIds, setBoostedProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [activeMainTab, setActiveMainTab] = useState('All'); // 'All' | 'Services'
  const [serviceProducts, setServiceProducts] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [subCatLoading, setSubCatLoading] = useState(false);
  const perPage = 9;

  const search = searchParams.get('search') || '';
  const categoryUrl = searchParams.get('category') || '';
  const typeUrl = searchParams.get('type') || '';
  const tabUrl = searchParams.get('tab') || '';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGetStorefrontVendorProducts('limit=400'),
      apiGetPublicActiveOffers(),
      apiGetActiveBoosts().catch(() => ({ data: { boostedProductIds: [] } })),
    ])
      .then(([pRes, oRes, boostRes]) => {
        const list = pRes.data?.products || [];
        const offers = oRes.data?.offers || [];
        const map = {};
        offers.forEach((o) => {
          map[String(o.productId?._id || o.productId)] = o;
        });
        setAllProducts(list);
        setOffersByProduct(map);
        setBoostedProductIds(boostRes.data?.boostedProductIds || []);
      })
      .catch(() => {
        setAllProducts([]);
        setOffersByProduct({});
        setBoostedProductIds([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // useEffect(() => {
  //   apiGetMasterCategories(null, 'buy')
  //     .then((res) => setCategoriesMaster(res.data?.tree || []))
  //     .catch(() => setCategoriesMaster([]));
  // }, []);
  useEffect(() => {
    api
      .get('/admin/get-categories')
      .then((res) => setCategoriesMaster(res.data || []))
      .catch(() => setCategoriesMaster([]));
  }, []);

  // useEffect(() => {
  //   if (!selectedCategory?._id) {
  //     setSubCategories([]);
  //     return;
  //   }
  //   setSubCatLoading(true);
  //   api
  //     .get(`/admin/get-sub-categories/${selectedCategory._id}`)
  //     .then((res) => setSubCategories(res.data || []))
  //     .catch(() => setSubCategories([]))
  //     .finally(() => setSubCatLoading(false));
  // }, [selectedCategory]);
  useEffect(() => {
    if (!selectedCategory?._id) {
      setSubCategories([]);
      return;
    }
    setSubCatLoading(true);
    api
      .get(`/admin/get-sub-categories/${selectedCategory._id}`)
      .then((res) => {
        const subs = res.data || [];
        setSubCategories(subs);
        // Auto-select first subcategory if none already selected
        if (subs.length > 0 && !filters.subCategory) {
          setFilters((p) => ({ ...p, subCategory: subs[0].name }));
        }
      })
      .catch(() => setSubCategories([]))
      .finally(() => setSubCatLoading(false));
  }, [selectedCategory]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishedIds([]);
      return;
    }
    let mounted = true;
    apiGetMyWishlist()
      .then((res) => {
        if (!mounted) return;
        setWishedIds(
          Array.isArray(res.data?.wishedProductIds)
            ? res.data.wishedProductIds
            : [],
        );
      })
      .catch(() => {
        if (!mounted) return;
        setWishedIds([]);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeMainTab !== 'Services') return;
    setServicesLoading(true);
    apiGetServiceProducts()
      .then((res) => setServiceProducts(res.data?.products || []))
      .catch(() => setServiceProducts([]))
      .finally(() => setServicesLoading(false));
  }, [activeMainTab]);

  // const filteredServiceProducts = useMemo(() => {
  //   return serviceProducts.filter((s) => {
  //     const matchesCategory = filters.category
  //       ? String(s.category || s.parentName || '').toLowerCase() ===
  //         String(filters.category).toLowerCase()
  //       : true;
  //     const matchesSubCategory = filters.subCategory
  //       ? String(s.subCategory || s.name || '').toLowerCase() ===
  //         String(filters.subCategory).toLowerCase()
  //       : true;
  //     return matchesCategory && matchesSubCategory;
  //   });
  // }, [serviceProducts, filters.category, filters.subCategory]);

  const filteredServiceProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return serviceProducts.filter((s) => {
      const serviceText = `${s.productName || s.title || s.name || ''} ${
        s.category || s.parentName || ''
      } ${s.subCategory || ''}`.toLowerCase();
      const matchesSearch = term ? serviceText.includes(term) : true;
      const matchesCategory = filters.category
        ? String(s.category || s.parentName || '').toLowerCase() ===
          String(filters.category).toLowerCase()
        : true;
      const matchesSubCategory = filters.subCategory
        ? String(s.subCategory || s.name || '').toLowerCase() ===
          String(filters.subCategory).toLowerCase()
        : true;
      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [serviceProducts, filters.category, filters.subCategory, search]);

  const getServicePriceValue = (s) => {
    const raw = s.price ?? s.startingPrice ?? 0;
    const n = Number(String(raw).replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  // const sortedServiceProducts = useMemo(() => {
  //   const arr = [...filteredServiceProducts];
  //   if (sortBy === 'price-low-high') {
  //     arr.sort((a, b) => getServicePriceValue(a) - getServicePriceValue(b));
  //   } else if (sortBy === 'price-high-low') {
  //     arr.sort((a, b) => getServicePriceValue(b) - getServicePriceValue(a));
  //   } else if (sortBy === 'newest') {
  //     arr.sort(
  //       (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  //     );
  //   }
  //   return arr;
  // }, [filteredServiceProducts, sortBy]);
  const sortedServiceProducts = useMemo(() => {
    const arr = [...filteredServiceProducts];
    if (sortBy === 'price-low-high') {
      arr.sort((a, b) => getServicePriceValue(a) - getServicePriceValue(b));
    } else if (sortBy === 'price-high-low') {
      arr.sort((a, b) => getServicePriceValue(b) - getServicePriceValue(a));
    } else if (sortBy === 'newest') {
      arr.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    }

    // Admin "Featured" services always come first, ordered by priorityRank.
    const isFeaturedActive = (s) =>
      s?.featured?.enabled === true && s?.featured?.status === 'live';
    const featured = arr
      .filter(isFeaturedActive)
      .sort(
        (a, b) =>
          Number(a?.featured?.priorityRank || 0) -
          Number(b?.featured?.priorityRank || 0),
      );
    const rest = arr.filter((s) => !isFeaturedActive(s));
    return [...featured, ...rest];
  }, [filteredServiceProducts, sortBy]);
  const isWished = (id) => wishedIds.includes(String(id));

  const onToggleWishlist = async (productId) => {
    if (!isAuthenticated) return;
    setTogglingId(String(productId));
    try {
      const res = await apiToggleWishlist(productId);
      const wished = !!res.data?.wished;
      setWishedIds((prev) => {
        const pid = String(productId);
        if (wished) return prev.includes(pid) ? prev : [...prev, pid];
        return prev.filter((x) => x !== pid);
      });
    } catch {
      // keep UI unchanged on failure
    } finally {
      setTogglingId('');
    }
  };

  const handleAddToCart = async (product, offer) => {
    let fullProduct = null;
    try {
      const res = await apiGetProductById(product._id);
      fullProduct = res.data?.product || null;
    } catch {}
    const productSource = fullProduct ? { ...product, ...fullProduct } : product;
    const isSellProduct =
      String(productSource.type || '').toLowerCase() === 'sell';

    // Match home/trending: variant-level rental tiers (template listings)
    // and product-level tiers are separate candidate groups.
    const candidateGroups = [
      Array.isArray(productSource.rentalConfigurations)
        ? productSource.rentalConfigurations
        : [],
      ...(Array.isArray(productSource.variants)
        ? productSource.variants.map((v) =>
            Array.isArray(v?.rentalConfigurations)
              ? v.rentalConfigurations
              : [],
          )
        : []),
    ].filter((group) => group.length > 0);

    let lowestPlan = null;
    let lowestPlanGroup = [];
    candidateGroups.forEach((group) => {
      const groupLowest = group
        .map((cfg) => ({
          price: Number(cfg?.customerRent || cfg?.pricePerDay || 0),
          months: Number(cfg?.months) || 1,
          periodUnit: cfg?.periodUnit === 'day' ? 'day' : 'month',
          rawDays: Number(cfg?.days) || 0,
        }))
        .filter((p) => p.price > 0)
        .sort((a, b) => {
          const perUnitA =
            a.periodUnit === 'day' && a.rawDays > 0
              ? a.price / a.rawDays
              : a.price;
          const perUnitB =
            b.periodUnit === 'day' && b.rawDays > 0
              ? b.price / b.rawDays
              : b.price;
          return perUnitA - perUnitB;
        })[0];
      if (!groupLowest) return;
      const currentPerUnit =
        groupLowest.periodUnit === 'day' && groupLowest.rawDays > 0
          ? groupLowest.price / groupLowest.rawDays
          : groupLowest.price;
      const bestPerUnit = lowestPlan
        ? lowestPlan.periodUnit === 'day' && lowestPlan.rawDays > 0
          ? lowestPlan.price / lowestPlan.rawDays
          : lowestPlan.price
        : Infinity;
      if (currentPerUnit < bestPerUnit) {
        lowestPlan = groupLowest;
        lowestPlanGroup = group;
      }
    });

    // // For month plans, lowestPlan.price is the per-month rate — multiply by
    // // months to get the total tenure price dispatched to the cart (day
    // // plans are unaffected).
    // // const cartPrice = lowestPlan
    // //   ? lowestPlan.periodUnit === 'day'
    // //     ? lowestPlan.price
    // //     : lowestPlan.price * (lowestPlan.months || 1)
    // //   : getRentalListingAmount(product);
    // const cartPrice = lowestPlan
    //   ? lowestPlan.price
    //   : getRentalListingAmount(product);
    // For month plans, lowestPlan.price is the per-month rate — multiply by
    // months to get the total tenure price dispatched to the cart (day
    // plans are unaffected).
    // const cartPrice = lowestPlan
    //   ? lowestPlan.periodUnit === 'day'
    //     ? lowestPlan.price
    //     : lowestPlan.price * (lowestPlan.months || 1)
    //   : getRentalListingAmount(product);
    const sellBasePrice = (() => {
      if (productSource?.salesConfiguration?.salePrice != null) {
        const n = Number(productSource.salesConfiguration.salePrice);
        if (Number.isFinite(n) && n > 0) return n;
      }
      const s = String(productSource?.price || '')
        .replace(/[^\d.]/g, '')
        .trim();
      const n = Number(s);
      if (Number.isFinite(n) && n > 0) return n;
      // Custom/manual multi-variant sell listings: fall back to the
      // first variant's own sellPrice.
      const variants = Array.isArray(productSource.variants)
        ? productSource.variants
        : [];
      const firstWithPrice = variants.find((v) => Number(v?.sellPrice) > 0);
      return firstWithPrice ? Number(firstWithPrice.sellPrice) : 0;
    })();

    const cartPrice = isSellProduct
      ? sellBasePrice || getRentalListingAmount(productSource)
      : lowestPlan
        ? lowestPlan.price
        : getRentalListingAmount(productSource);
    const discount = resolveDiscountPercent(offer);
    const finalCartPrice =
      discount > 0
        ? Math.max(0, Math.round(cartPrice - (cartPrice * discount) / 100))
        : cartPrice;

    const taxSource =
      fullProduct?.subCategoryTax ?? product?.subCategoryTax ?? {};

    dispatch(
      addToCart(
        isSellProduct
          ? {
              productId: product._id,
              variantId: null,
              variantName: '',
              quantity: 1,
              rentalMonths: 1,
              pricePerDay: finalCartPrice,
              originalPricePerDay: cartPrice,
              title: productSource.productName || '',
              image: productSource.image || '',
              tenureUnit: 'month',
              productType: 'Sell',
              refundableDeposit: 0,
              condition: productSource?.condition || 'Brand New',
              rentalConfigurations: [],
              offer: offer || null,
              defaultGst: taxSource?.defaultGst ?? null,
              defaultCareTax: taxSource?.defaultCareTax ?? null,
              defaultRepairWarranty: taxSource?.defaultRepairWarranty ?? null,
              defaultRelocationWarranty:
                taxSource?.defaultRelocationWarranty ?? null,
              defaultDeliveryPackaging:
                taxSource?.defaultDeliveryPackaging ?? null,
              defaultInstallationFee: taxSource?.defaultInstallationFee ?? null,
              defaultPlatformFee: taxSource?.defaultPlatformFee ?? null,
              taxBlocked: taxSource?.taxBlocked ?? false,
            }
          : {
              productId: product._id,
              variantId: null,
              variantName: '',
              quantity: 1,
              rentalMonths: lowestPlan?.months || 1,
              pricePerDay: finalCartPrice,
              originalPricePerDay: cartPrice,
              title: productSource.productName || '',
              image: productSource.image || '',
              tenureUnit: lowestPlan?.periodUnit || 'month',
              productType: 'Rental',
              refundableDeposit: Number(productSource.refundableDeposit || 0),
              condition: productSource?.condition || '',
              rentalConfigurations: lowestPlanGroup.length
                ? lowestPlanGroup
                : productSource.rentalConfigurations || [],
              offer: offer || null,
              defaultGst: taxSource?.defaultGst ?? null,
              defaultCareTax: taxSource?.defaultCareTax ?? null,
              defaultRepairWarranty: taxSource?.defaultRepairWarranty ?? null,
              defaultRelocationWarranty:
                taxSource?.defaultRelocationWarranty ?? null,
              defaultDeliveryPackaging:
                taxSource?.defaultDeliveryPackaging ?? null,
              defaultInstallationFee: taxSource?.defaultInstallationFee ?? null,
              defaultPlatformFee: taxSource?.defaultPlatformFee ?? null,
              taxBlocked: taxSource?.taxBlocked ?? false,
            },
      ),
    );
  };

  const handleNotifyMe = async (productId) => {
    const pid = String(productId);
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    if (notifiedIds.has(pid)) {
      pushToast("You're already on the waitlist for this product.", 'info');
      return;
    }
    setNotifyingIds((prev) => new Set(prev).add(pid));
    try {
      const res = await apiRequestStockNotify(productId);
      setNotifiedIds((prev) => {
        const next = new Set(prev).add(pid);
        try {
          localStorage.setItem(
            'rn_notified_product_ids',
            JSON.stringify([...next]),
          );
        } catch {}
        return next;
      });
      pushToast(
        res.data?.alreadyRequested
          ? "You're already on the waitlist for this product."
          : 'We will notify you when this product is back in stock!',
        res.data?.alreadyRequested ? 'info' : 'success',
      );
    } catch {
      pushToast('Something went wrong. Please try again.', 'error');
    } finally {
      setNotifyingIds((prev) => {
        const next = new Set(prev);
        next.delete(pid);
        return next;
      });
    }
  };

  // useEffect(() => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     category: categoryUrl || prev.category,
  //     type: typeUrl || prev.type,
  //   }));
  // }, [categoryUrl, typeUrl]);
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: categoryUrl || prev.category,
      type: typeUrl || prev.type,
    }));
  }, [categoryUrl, typeUrl]);

  // useEffect(() => {
  //   if (tabUrl.toLowerCase() === 'services') {
  //     setActiveMainTab('Services');
  //   }
  // }, [tabUrl]);
  // Auto-select subcategory from URL
  useEffect(() => {
    const subCategoryUrl = searchParams.get('subCategory') || '';
    if (!subCategoryUrl) return;
    setFilters((prev) => ({
      ...prev,
      subCategory: subCategoryUrl,
    }));
  }, [searchParams]);

  // Auto-select category object from master when coming from another page
  useEffect(() => {
    if (!categoryUrl || !categoriesMaster.length) return;
    const matched = categoriesMaster.find(
      (c) => c.name.toLowerCase() === categoryUrl.toLowerCase(),
    );
    if (matched) {
      setSelectedCategory(matched);
    }
  }, [categoryUrl, categoriesMaster]);

  // Default to the first rental-enabled category when arriving via "View All" (type=Rental)
  // useEffect(() => {
  //   if (categoryUrl) return;
  //   if (String(typeUrl).toLowerCase() !== 'rental') return;
  //   if (!categoriesMaster.length) return;
  //   if (selectedCategory) return;
  //   const firstRental = categoriesMaster.find((c) => c.availableInRent);
  //   if (firstRental) {
  //     setSelectedCategory(firstRental);
  //     setFilters((p) => ({ ...p, category: firstRental.name }));
  //   }
  // }, [categoryUrl, typeUrl, categoriesMaster, selectedCategory]);
  // Auto-select category object from master when coming from another page
  // useEffect(() => {
  //   if (!categoriesMaster.length) return;

  //   if (categoryUrl) {
  //     const matched = categoriesMaster.find(
  //       (c) => c.name.toLowerCase() === categoryUrl.toLowerCase(),
  //     );
  //     if (matched) {
  //       setSelectedCategory(matched);
  //     }
  //     return;
  //   }

  //   // No category in the URL (e.g. coming from "View All") —
  //   // default to the first available category so its pill + sub-categories show.
  //   if (!selectedCategory) {
  //     setSelectedCategory(categoriesMaster[0]);
  //     setFilters((p) => ({ ...p, category: categoriesMaster[0].name }));
  //   }
  // }, [categoryUrl, categoriesMaster, selectedCategory]);

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set(allProducts.map((p) => p.category).filter(Boolean)),
    );
  }, [allProducts]);
  // const displayCategoriesMaster = useMemo(() => {
  //   const t = String(typeUrl).toLowerCase();
  //   if (t === 'rental') {
  //     return categoriesMaster.filter((c) => c.availableInRent);
  //   }
  //   if (t === 'sell') {
  //     return categoriesMaster.filter((c) => c.availableInBuy);
  //   }
  //   if (String(tabUrl).toLowerCase() === 'services') {
  //     return categoriesMaster.filter((c) => c.availableInServices);
  //   }
  //   return categoriesMaster;
  // }, [categoriesMaster, typeUrl, tabUrl]);
  const displayCategoriesMaster = useMemo(() => {
    const t = String(typeUrl).toLowerCase();
    if (t === 'rental') {
      return categoriesMaster.filter((c) => c.availableInRent);
    }
    if (t === 'sell') {
      return categoriesMaster.filter((c) => c.availableInBuy);
    }
    if (String(tabUrl).toLowerCase() === 'services') {
      return categoriesMaster.filter((c) => c.availableInServices);
    }
    // Default (no type/tab in URL): show only categories available for
    // Rent or Buy — this page's grid never renders service products, so
    // service-only categories would show pills with no matching results.
    return categoriesMaster.filter(
      (c) => c.availableInRent || c.availableInBuy,
    );
  }, [categoriesMaster, typeUrl, tabUrl]);

  const subCategoryOptions = useMemo(() => {
    const rows = allProducts
      .filter((p) => {
        if (!filters.category) return true;
        return (
          String(p.category || '').toLowerCase() ===
          String(filters.category).toLowerCase()
        );
      })
      .map((p) => p.subCategory)
      .filter(Boolean);
    return Array.from(new Set(rows));
  }, [allProducts, filters.category]);

  // const brands = useMemo(() => {
  //   const rows = allProducts
  //     .filter((p) => {
  //       if (!filters.category) return true;
  //       return (
  //         String(p.category || '').toLowerCase() ===
  //         String(filters.category).toLowerCase()
  //       );
  //     })
  //     .map((p) => p.brand)
  //     .filter(Boolean);
  //   return Array.from(new Set(rows)).slice(0, 6);
  // }, [allProducts, filters.category]);

  const brands = useMemo(() => {
    const rows = allProducts
      .filter((p) => {
        const matchesCategory = filters.category
          ? String(p.category || '').toLowerCase() ===
            String(filters.category).toLowerCase()
          : true;
        const matchesType = filters.type
          ? String(p.type || '').toLowerCase() ===
            String(filters.type).toLowerCase()
          : true;
        return matchesCategory && matchesType;
      })
      .map((p) => p.brand)
      .filter(Boolean);
    return Array.from(new Set(rows)).slice(0, 6);
  }, [allProducts, filters.category, filters.type]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const min = Number(filters.minPrice || 0);
    const max = Number(filters.maxPrice || 0);

    return allProducts.filter((p) => {
      const price = getProductListPriceValue(p);
      const productText =
        `${p.productName || ''} ${p.category || ''} ${p.subCategory || ''}`.toLowerCase();
      const matchesSearch = term ? productText.includes(term) : true;
      const matchesCategory = filters.category
        ? String(p.category || '').toLowerCase() ===
          String(filters.category).toLowerCase()
        : true;
      const matchesType = filters.type
        ? String(p.type || '').toLowerCase() ===
          String(filters.type).toLowerCase()
        : true;
      const matchesAvailability =
        filters.availability === 'available'
          ? Number(p.stock || 0) > 0
          : filters.availability === 'unavailable'
            ? Number(p.stock || 0) <= 0
            : true;
      const matchesCondition =
        !filters.condition || filters.condition === 'All'
          ? true
          : String(p.condition || '').toLowerCase() ===
            filters.condition.toLowerCase();
      const matchesMin = filters.minPrice ? price >= min : true;
      const matchesMax = filters.maxPrice ? price <= max : true;
      const matchesSubCategory = filters.subCategory
        ? String(p.subCategory || '').toLowerCase() ===
          String(filters.subCategory).toLowerCase()
        : true;
      const matchesBrand = filters.brand
        ? String(p.brand || '').toLowerCase() ===
          String(filters.brand).toLowerCase()
        : true;
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubCategory &&
        matchesBrand &&
        matchesType &&
        matchesAvailability &&
        matchesCondition &&
        matchesMin &&
        matchesMax
      );
    });
  }, [allProducts, filters, search]);

  // const sortedProducts = useMemo(() => {
  //   const arr = [...filteredProducts];
  //   if (sortBy === 'price-low-high') {
  //     arr.sort(
  //       (a, b) => getProductListPriceValue(a) - getProductListPriceValue(b),
  //     );
  //   } else if (sortBy === 'price-high-low') {
  //     arr.sort(
  //       (a, b) => getProductListPriceValue(b) - getProductListPriceValue(a),
  //     );
  //   } else if (sortBy === 'newest') {
  //     arr.sort(
  //       (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  //     );
  //   }
  //   // Float boosted products to the top
  //   if (boostedProductIds.length > 0) {
  //     const boosted = arr.filter((p) =>
  //       boostedProductIds.includes(String(p._id)),
  //     );
  //     const rest = arr.filter(
  //       (p) => !boostedProductIds.includes(String(p._id)),
  //     );
  //     return [...boosted, ...rest];
  //   }
  //   return arr;
  // }, [filteredProducts, sortBy, boostedProductIds]);
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    if (sortBy === 'price-low-high') {
      arr.sort(
        (a, b) => getProductListPriceValue(a) - getProductListPriceValue(b),
      );
    } else if (sortBy === 'price-high-low') {
      arr.sort(
        (a, b) => getProductListPriceValue(b) - getProductListPriceValue(a),
      );
    } else if (sortBy === 'newest') {
      arr.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    }

    // Admin "Featured" items always come first, ordered by priorityRank.
    // Only counts if status is 'live' — an 'inactive' toggle in the admin
    // featured table excludes it here automatically.
    const isFeaturedActive = (p) =>
      p?.featured?.enabled === true && p?.featured?.status === 'live';
    const featured = arr
      .filter(isFeaturedActive)
      .sort(
        (a, b) =>
          Number(a?.featured?.priorityRank || 0) -
          Number(b?.featured?.priorityRank || 0),
      );
    const nonFeatured = arr.filter((p) => !isFeaturedActive(p));

    // Float boosted products to the top of the remaining (non-featured) list.
    if (boostedProductIds.length > 0) {
      const boosted = nonFeatured.filter((p) =>
        boostedProductIds.includes(String(p._id)),
      );
      const rest = nonFeatured.filter(
        (p) => !boostedProductIds.includes(String(p._id)),
      );
      return [...featured, ...boosted, ...rest];
    }
    return [...featured, ...nonFeatured];
  }, [filteredProducts, sortBy, boostedProductIds]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / perPage));
  const products = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedProducts.slice(start, start + perPage);
  }, [sortedProducts, page]);

  // useEffect(() => {
  //   api
  //     .get('/get-categories')
  //     .then((res) => setCategoriesMaster(res.data || []))
  //     .catch(() => setCategoriesMaster([]));
  // }, []);

  useEffect(() => {
    setPage(1);
  }, [filters, search, sortBy]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // const topTabs = useMemo(() => {
  //   const set = new Set(
  //     allProducts
  //       .map((p) => String(p?.subCategory || '').trim())
  //       .filter(Boolean),
  //   );
  //   return Array.from(set);
  // }, [allProducts]);

  // const iconCategories = useMemo(() => {
  //   const fromMaster = (categoriesMaster || []).map((c) => ({
  //     name: String(c?.name || '').trim(),
  //     image: c?.image || '',
  //   }));
  //   const fromProducts = categoryOptions
  //     .filter(
  //       (name) =>
  //         !fromMaster.some((m) => m.name.toLowerCase() === name.toLowerCase()),
  //     )
  //     .map((name) => ({ name, image: '' }));
  //   return [...fromMaster, ...fromProducts].filter((x) => x.name);
  // }, [categoriesMaster, categoryOptions]);

  // const breadcrumbCategory =
  //   filters.category ||
  //   categoryUrl ||
  //   String(allProducts?.[0]?.category || '').trim() ||
  //   'Category';
  // const breadcrumbSubCategory =
  //   filters.subCategory ||
  //   String(
  //     allProducts.find(
  //       (p) =>
  //         String(p?.category || '').toLowerCase() ===
  //         String(breadcrumbCategory || '').toLowerCase(),
  //     )?.subCategory || '',
  //   ).trim();

  // const FilterSidebar = () => (
  //   <aside className="w-full lg:w-72 flex-shrink-0 space-y-5 bg-white border border-gray-200 rounded-2xl p-4 h-fit">
  //     <div className="flex items-center justify-between">
  //       <h3 className="font-semibold text-gray-900">Filters</h3>
  //       <button
  //         onClick={() =>
  //           setFilters({
  //             minPrice: '',
  //             maxPrice: '',
  //             category: categoryUrl || '',
  //             subCategory: '',
  //             brand: '',
  //             type: typeUrl || '',
  //             availability: '',
  //           })
  //         }
  //         className="text-xs text-orange-500 hover:underline"
  //       >
  //         Clear All
  //       </button>
  //     </div>

  const FilterSidebar = () => (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-4 h-fit lg:max-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() =>
            setFilters({
              minPrice: '',
              maxPrice: '',
              category: categoryUrl || '',
              subCategory: '',
              brand: '',
              type: typeUrl || '',
              availability: '',
            })
          }
          className="text-xs text-orange-500 hover:underline"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-5 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Price Range</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="₹100"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters((p) => ({ ...p, minPrice: e.target.value }))
            }
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="number"
            placeholder="₹5000"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((p) => ({ ...p, maxPrice: e.target.value }))
            }
            className="px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div> */}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Price Range</p>

          <div className="space-y-3">
            {/* Range Slider */}
            <input
              type="range"
              min="0"
              max="100000"
              step="500"
              value={filters.maxPrice || 100000}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  minPrice: 0,
                  maxPrice: e.target.value,
                }))
              }
              className="w-full accent-orange-500"
            />

            {/* Display values */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹0</span>
              <span className="font-medium text-gray-700">
                Up to ₹{filters.maxPrice || 100000}
              </span>
              <span>₹1,00,000</span>
            </div>
          </div>
        </div>

        {/* <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              category: e.target.value,
              subCategory: '',
            }))
          }
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div> */}

        {/* <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Sub Category</p>
        <select
          value={filters.subCategory || ''}
          onChange={(e) =>
            setFilters((p) => ({ ...p, subCategory: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All</option>
          {subCategoryOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div> */}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Brand</p>
          <div className="space-y-1.5 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="brand"
                checked={!filters.brand}
                onChange={() => setFilters((p) => ({ ...p, brand: '' }))}
              />
              <span>All</span>
            </label>
            {brands.length ? (
              brands.map((b) => (
                <label key={b} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="brand"
                    checked={filters.brand === b}
                    onChange={() => setFilters((p) => ({ ...p, brand: b }))}
                  />
                  <span>{b}</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-500">No brands</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Condition</p>

          <div className="space-y-1.5 text-sm">
            {['All', 'Brand New', 'Refurbished', 'Mint Condition'].map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  checked={filters.condition === c}
                  onChange={() =>
                    setFilters((p) => ({
                      ...p,
                      condition: c,
                    }))
                  }
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Availability</p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Exclude Out of Stock</span>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={filters.availability === 'available'}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    availability: e.target.checked ? 'available' : '',
                  }))
                }
              />

              <div className="w-11 h-6 bg-gray-300 peer-checked:bg-orange-500 rounded-full transition-colors"></div>

              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="w-full mx-auto px-4 py-1 sm:px-6 lg:px-8">
      {/* ROW 1: Breadcrumb + Category pills in one horizontal scroll row */}
      {/* <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 mb-1"> */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 mb-1 w-full">
        {/* <div className="shrink-0 flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
          <span
            className="cursor-pointer hover:text-orange-500 transition"
            onClick={() => {
              setSelectedCategory(null);
              setSubCategories([]);
              setFilters((p) => ({ ...p, category: '', subCategory: '' }));
              router.push('/');
            }}
          >
            Home
          </span> */}
        {/* Breadcrumb */}
        {selectedCategory && (
          <div className="shrink-0 flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
            {/* {selectedCategory && (
            <>
              <span className="text-gray-400">›</span>
              <span
                className="cursor-pointer hover:text-orange-500 transition"
                onClick={() => setFilters((p) => ({ ...p, subCategory: '' }))}
              >
                {selectedCategory.name}
              </span>
            </>
          )}
          {filters.subCategory && (
            <>
              <span className="text-gray-400">›</span>
              <span className="text-orange-500 font-medium">
                {filters.subCategory}
              </span>
            </>
          )}

          {!selectedCategory && !filters.subCategory && (
            <>
              <span className="text-gray-400">›</span>
              <span
                className="cursor-pointer text-gray-700 hover:text-orange-500 transition"
                onClick={() => {
                  setSelectedCategory(null);
                  setSubCategories([]);
                  setFilters((p) => ({ ...p, category: '', subCategory: '' }));
                  router.push('/products');
                }}
              >
                All Products
              </span>
            </>
          )} */}

            {/* <span className="text-gray-400">›</span> */}
            {/* <span
            className="cursor-pointer text-gray-700 hover:text-orange-500 transition"
            onClick={() => {
              setSelectedCategory(null);
              setSubCategories([]);
              setFilters((p) => ({ ...p, category: '', subCategory: '' }));
              router.push('/products');
            }}
          >
            All Products
          </span> */}
            {selectedCategory && (
              <>
                {/* <span className="text-gray-400">›</span> */}
                <span
                  className="cursor-pointer hover:text-orange-500 transition"
                  onClick={() => setFilters((p) => ({ ...p, subCategory: '' }))}
                >
                  {selectedCategory.name}
                </span>
              </>
            )}
            {/* {filters.subCategory && (
            <>
              <span className="text-gray-400">›</span>
              <span className="text-orange-500 font-medium">
                {filters.subCategory}
              </span>
            </>
          )}
          <span className="ml-2 text-gray-300">|</span> */}
          </div>
        )}

        {/* Category pills — scroll horizontally */}
        {displayCategoriesMaster.map((cat) => {
          const isActive =
            String(filters.category || '').toLowerCase() ===
            cat.name.toLowerCase();
          return (
            <button
              key={cat._id}
              onClick={() => {
                setSelectedCategory(cat);
                setFilters((p) => ({
                  ...p,
                  category: cat.name,
                  subCategory: '',
                }));
              }}
              // className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium transition whitespace-nowrap ${
              //   isActive
              //     ? 'border-orange-400 bg-orange-50 text-orange-500'
              //     : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              // }`}
              className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium transition whitespace-nowrap ${
                isActive
                  ? 'border-[#F97316] bg-[#F97316] text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* {selectedCategory && (
        <div className="mb-5"> */}
      {selectedCategory && (
        <div className="mb-5 w-full">
          {subCatLoading ? (
            <div className="flex gap-3 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-16 h-20 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : subCategories.length > 0 ? (
            // <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide w-full">
              {subCategories.map((sub) => {
                const isActive =
                  String(filters.subCategory || '').toLowerCase() ===
                  sub.name.toLowerCase();
                return (
                  // <button
                  //   key={sub._id}
                  //   onClick={() =>
                  //     setFilters((p) => ({ ...p, subCategory: sub.name }))
                  //   }
                  //   className={`shrink-0 flex flex-col items-center gap-0.5 pt-0 pb-1.5 px-0 rounded-xl border min-w-[80px] transition overflow-hidden ${
                  //     isActive
                  //       ? 'border-orange-400 bg-orange-50'
                  //       : 'border-gray-200 bg-white hover:bg-gray-50'
                  //   }`}
                  // >
                  //   <div className="w-full h-14 bg-gray-100 overflow-hidden">
                  //     {sub.image ? (
                  //       <img
                  //         src={sub.image}
                  //         alt={sub.name}
                  //         className="w-full h-full object-cover"
                  //       />
                  //     ) : (
                  // <button
                  //   key={sub._id}
                  //   onClick={() =>
                  //     setFilters((p) => ({ ...p, subCategory: sub.name }))
                  //   }
                  //   style={{
                  //     width: '80px',
                  //     minWidth: '80px',
                  //     maxWidth: '80px',
                  //   }}
                  //   className={`shrink-0 flex flex-col items-center gap-0.5 pt-0 pb-1.5 px-0 rounded-xl border transition overflow-hidden ${
                  //     isActive
                  //       ? 'border-orange-400 bg-orange-50'
                  //       : 'border-gray-200 bg-white hover:bg-gray-50'
                  //   }`}
                  // >
                  //   <div
                  //     className="w-full h-14 bg-gray-100 overflow-hidden relative"
                  //     style={{
                  //       WebkitMaskImage:
                  //         '-webkit-radial-gradient(white, black)',
                  //     }}
                  //   >
                  //     {sub.image ? (
                  //       <img
                  //         src={sub.image}
                  //         alt={sub.name}
                  //         width={80}
                  //         height={56}
                  //         className="w-full h-full object-cover block"
                  //       />
                  //     ) : (
                  //       <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-medium">
                  //         {sub.name.slice(0, 2).toUpperCase()}
                  //       </div>
                  //     )}
                  //   </div>
                  //   <span
                  //     className={`text-[11px] font-semibold text-center leading-tight max-w-[72px] line-clamp-2 ${
                  //       isActive
                  //         ? 'text-orange-500 font-medium'
                  //         : 'text-gray-700'
                  //     }`}
                  //   >
                  //     {sub.name}
                  //   </span>
                  // </button>

                  <button
                    key={sub._id}
                    onClick={() =>
                      setFilters((p) => ({ ...p, subCategory: sub.name }))
                    }
                    style={{
                      width: '80px',
                      minWidth: '80px',
                      maxWidth: '80px',
                    }}
                    className="shrink-0 flex flex-col items-center gap-1.5 pt-0 pb-1.5 px-0 bg-transparent transition"
                  >
                    <div
                      className={`w-full h-14 rounded-xl border overflow-hidden relative ${
                        isActive
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 bg-gray-100 hover:bg-gray-50'
                      }`}
                      style={{
                        WebkitMaskImage:
                          '-webkit-radial-gradient(white, black)',
                      }}
                    >
                      {sub.image ? (
                        <img
                          src={sub.image}
                          alt={sub.name}
                          width={80}
                          height={56}
                          className="w-full h-full object-cover block"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-medium">
                          {sub.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold text-center leading-tight max-w-[76px] truncate whitespace-nowrap pb-0.5 border-b-2 ${
                        isActive
                          ? 'text-orange-500 border-orange-400'
                          : 'text-gray-700 border-transparent'
                      }`}
                    >
                      {sub.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      {/* ROW 3: Filter sidebar + product grid */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <FilterSidebar />
        </div>

        <div className="flex-1">
          {/* Products / Services tab */}
          {/* <div className="mb-4 flex items-center gap-6 text-sm">
            {['Products', 'Services'].map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveMainTab(tab === 'Products' ? 'All' : 'Services')
                }
                className={`pb-1 transition ${
                  (
                    tab === 'Products'
                      ? activeMainTab !== 'Services'
                      : activeMainTab === 'Services'
                  )
                    ? 'border-b-2 border-black font-medium text-black'
                    : 'text-gray-500'
                }`}
              >
                <span className="uppercase tracking-wide">{tab}</span>
              </button>
            ))}
          </div> */}

          {/* Sort + View toggle bar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="lg:hidden inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pr-8 pl-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                >
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="newest">Newest first</option>
                  <option value="price-low-high">Price: Low to high</option>
                  <option value="price-high-low">Price: High to low</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-2.5" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-gray-500">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile filter sidebar */}
          {mobileFiltersOpen && (
            <div className="lg:hidden mb-4">
              <FilterSidebar />
            </div>
          )}

          {/* Loading */}
          {/* {activeMainTab === 'Services' ? (
            servicesLoading ? (
              <div className="flex justify-center items-center py-24">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sortedServiceProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-gray-500 text-lg font-medium">
                  No services found
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'list'
                    ? 'grid grid-cols-1 gap-4'
                    : 'grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-6'
                }
              >
                {sortedServiceProducts.map((s) => (
                  <div key={s._id}>
                    <ProductCard
                      product={{ ...s, type: 'Service' }}
                      offer={offersByProduct[String(s._id)]}
                    />
                  </div>
                ))}
              </div>
            )
          ) : loading ? ( */}
          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-gray-500 text-lg font-medium">
                No products found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your filters or search term
              </p>
            </div>
          ) : (
            <>
              {/* Product count */}
              <p className="text-sm text-gray-500 mb-4">
                Showing{' '}
                <span className="font-medium text-gray-700">
                  {sortedProducts.length}
                </span>{' '}
                product{sortedProducts.length !== 1 ? 's' : ''}
              </p>

              {/* Product grid */}
              {/* <div
                className={
                  viewMode === 'list'
                    ? 'grid grid-cols-1 gap-4'
                    : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                }
              >
                {products.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    offer={offersByProduct[String(p._id)]}
                    isAuthenticated={isAuthenticated}
                    isWishlisted={isWished(p._id)}
                    toggling={togglingId === String(p._id)}
                    onToggleWishlist={onToggleWishlist}
                    onAddToCart={() =>
                      handleAddToCart(p, offersByProduct[String(p._id)])
                    }
                    onNotifyMe={handleNotifyMe}
                    isNotifying={notifyingIds.has(String(p._id))}
                    isNotified={notifiedIds.has(String(p._id))}
                  />
                ))}
              </div> */}
              {/* 
              <div
                className={
                  viewMode === 'list'
                    ? 'grid grid-cols-1 gap-4'
                    : 'flex overflow-x-auto sm:overflow-visible gap-2 sm:gap-6 sm:grid sm:grid-cols-2 xl:grid-cols-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none scrollbar-hide'
                }
              >
                {products.map((p) => (
                  <div
                    key={p._id}
                    className={
                      viewMode === 'list'
                        ? ''
                        : 'w-[52%] flex-shrink-0 snap-start sm:w-auto sm:flex-shrink'
                    }
                  >
                    <ProductCard
                      product={p}
                      offer={offersByProduct[String(p._id)]}
                      isAuthenticated={isAuthenticated}
                      isWishlisted={isWished(p._id)}
                      toggling={togglingId === String(p._id)}
                      onToggleWishlist={onToggleWishlist}
                      onAddToCart={() =>
                        handleAddToCart(p, offersByProduct[String(p._id)])
                      }
                      onNotifyMe={handleNotifyMe}
                      isNotifying={notifyingIds.has(String(p._id))}
                      isNotified={notifiedIds.has(String(p._id))}
                    />
                  </div>
                ))}
              </div> */}

              <div
                className={
                  viewMode === 'list'
                    ? 'grid grid-cols-1 gap-4'
                    : 'grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-6'
                }
              >
                {products.map((p) => (
                  <div key={p._id}>
                    <ProductCard
                      product={p}
                      offer={
                        boostedProductIds.includes(String(p._id)) &&
                        !offersByProduct[String(p._id)]?.sticker
                          ? {
                              ...offersByProduct[String(p._id)],
                              sticker: 'Bestseller',
                            }
                          : offersByProduct[String(p._id)]
                      }
                      isAuthenticated={isAuthenticated}
                      isWishlisted={isWished(p._id)}
                      toggling={togglingId === String(p._id)}
                      onToggleWishlist={onToggleWishlist}
                      onAddToCart={() =>
                        handleAddToCart(p, offersByProduct[String(p._id)])
                      }
                      onNotifyMe={handleNotifyMe}
                      isNotifying={notifyingIds.has(String(p._id))}
                      isNotified={notifiedIds.has(String(p._id))}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-full border-2 border-orange-300 text-orange-600 hover:bg-[#FF6F00] hover:text-white transition disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FF6F00] text-sm font-medium text-white">
                    {page}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-full border-2 cursor-pointer border-orange-300 text-orange-600 hover:bg-[#FF6F00] hover:text-white transition disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
