// /**
//  * Extracts city from a mapAddress string like:
//  * "Mananchira, Kozhikode, Kerala, India" -> "Kozhikode"
//  */
// export const extractCityFromAddress = (mapAddress) => {
//   if (!mapAddress || typeof mapAddress !== 'string') return '';

//   const parts = mapAddress
//     .split(',')
//     .map((s) => s.trim())
//     .filter(Boolean);

//   if (parts.length < 3) {
//     return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || '';
//   }

//   return parts[parts.length - 3]; // [locality, CITY, state, country]
// };

/**
 * Extracts city from a mapAddress string like:
 * "Mananchira, Kozhikode, Kerala, India" -> "Kozhikode"
 *
 * Indian Google-geocoded addresses often insert admin layers like
 * "Pune City Subdistrict" / "Pune District" between the locality and the
 * state, which breaks a fixed-position lookup. We strip common admin
 * suffixes from every part first, so "Pune District" -> "Pune".
 */
const ADMIN_SUFFIX_REGEX =
  /\s+(city subdistrict|subdistrict|district|taluk|tehsil|mandal|division)$/i;

const stripAdminSuffix = (s) =>
  String(s || '')
    .replace(ADMIN_SUFFIX_REGEX, '')
    .trim();

export const extractCityFromAddress = (mapAddress) => {
  if (!mapAddress || typeof mapAddress !== 'string') return '';

  const parts = mapAddress
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let raw;
  if (parts.length < 3) {
    raw = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || '';
  } else {
    raw = parts[parts.length - 3]; // [locality, CITY, state, country]
  }

  return stripAdminSuffix(raw);
};
