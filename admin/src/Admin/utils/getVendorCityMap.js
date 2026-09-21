async function getVendorCityMap() {
  const vendors = await VendorKYC.find({ status: 'approved' }).select(
    'vendorId storeManagement.stores',
  );

  const cities = await City.find({ serviceEnabled: true });

  const vendorToCity = {};

  for (const v of vendors) {
    const store =
      v.storeManagement.stores.find((s) => s.isDefault) ||
      v.storeManagement.stores[0];
    if (!store) continue;

    let matched = cities.find((c) =>
      store.mapAddress?.toLowerCase().includes(c.cityName.toLowerCase()),
    );

    if (!matched) {
      matched = cities.reduce((closest, c) => {
        const d = Math.hypot(
          store.mapLat - c.latitude,
          store.mapLng - c.longitude,
        );
        return !closest || d < closest.d ? { c, d } : closest;
      }, null)?.c;
    }

    if (matched) vendorToCity[v.vendorId.toString()] = matched.cityKey;
  }

  return vendorToCity;
}
