// City View Service: Provides real-world location imagery using OpenStreetMap (free)

interface LocationData {
  lat: number;
  lon: number;
  name: string;
  type: string;
  tags?: { [key: string]: string };
  source?: string;
  address?: string;
  category?: string;
}

/**
 * Mendapatkan URL gambar peta standar dari OpenStreetMap dengan fallback
 */
export function getOpenStreetMapStandardUrl(
  location: LocationData,
  _width = 600,
  _height = 400,
  zoom = 15
): string {
  // Calculate tile coordinates
  // const x = Math.floor(((location.lon + 180) / 360) * Math.pow(2, zoom))
  // const y = Math.floor(((1 - Math.log(Math.tan((location.lat * Math.PI) / 180) + 1 / Math.cos((location.lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, zoom))

  return `https://tile.openstreetmap.org/${zoom}/${Math.floor(
    ((location.lon + 180) / 360) * Math.pow(2, zoom)
  )}/${Math.floor(
    ((1 -
      Math.log(
        Math.tan((location.lat * Math.PI) / 180) +
          1 / Math.cos((location.lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  )}.png`;
}

/**
 * Mendapatkan URL gambar peta dengan tampilan satelit dari OpenStreetMap
 * Menggunakan layer Esri World Imagery yang tersedia melalui OpenStreetMap
 */
export function getOpenStreetMapSatelliteUrl(
  location: LocationData,
  width = 800,
  height = 600,
  zoom = 15
): string {
  // Menggunakan OpenStreetMap dengan layer Esri World Imagery
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${location.lat},${location.lon}&zoom=${zoom}&size=${width}x${height}&markers=${location.lat},${location.lon},red&maptype=esri_worldimagery`;
}

/**
 * Mendapatkan URL gambar peta dengan tampilan jalan dari OpenStreetMap
 */
export function getOpenStreetMapStreetViewUrl(
  location: LocationData,
  width = 800,
  height = 600,
  zoom = 17
): string {
  // Untuk street view, kita gunakan zoom yang lebih tinggi
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${location.lat},${location.lon}&zoom=${zoom}&size=${width}x${height}&markers=${location.lat},${location.lon},red`;
}

/**
 * Alternative service menggunakan MapBox static API (fallback)
 */
export function getMapBoxStaticUrl(
  location: LocationData,
  viewType: 'satellite' | 'map' | 'streetview' = 'map',
  width = 800,
  height = 600,
  zoom = 15
): string {
  const mapType = viewType === 'satellite' ? 'satellite-v9' : 'streets-v11';
  // Note: Dalam implementasi nyata, Anda perlu API key MapBox
  return `https://api.mapbox.com/styles/v1/mapbox/${mapType}/static/pin-s-l+000(${location.lon},${location.lat})/${location.lon},${location.lat},${zoom}/${width}x${height}?access_token=YOUR_MAPBOX_TOKEN`;
}

/**
 * Alternative menggunakan service yang lebih simple dan reliable
 */
export function getSimpleMapUrl(
  location: LocationData,
  viewType: 'satellite' | 'map' | 'streetview' = 'map'
): string {
  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
  const maptype =
    viewType === 'satellite'
      ? 'satellite'
      : viewType === 'map'
      ? 'roadmap'
      : 'roadmap';

  // Note: Dalam production, gunakan API key yang valid
  return `${baseUrl}?center=${location.lat},${location.lon}&zoom=15&size=600x400&maptype=${maptype}&markers=color:red%7C${location.lat},${location.lon}&key=YOUR_API_KEY`;
}

/**
 * Fallback menggunakan placeholder image
 */
export function getPlaceholderImageUrl(
  location: LocationData,
  viewType: 'satellite' | 'map' | 'streetview' = 'map',
  width = 800,
  height = 600
): string {
  const query = `${viewType} view of ${location.name} at coordinates ${location.lat}, ${location.lon}`;
  return `/placeholder.svg?height=${height}&width=${width}&query=${encodeURIComponent(
    query
  )}`;
}

/**
 * Fallback menggunakan placeholder yang selalu bekerja
 */
export function getReliablePlaceholderUrl(
  location: LocationData,
  viewType: 'satellite' | 'map' | 'streetview' = 'map'
): string {
  const query = `${viewType} view of ${location.name}`;
  return `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(
    query
  )}`;
}

/**
 * Mendapatkan URL gambar untuk lokasi berdasarkan jenis tampilan
 * Semua menggunakan OpenStreetMap yang gratis
 */
export function getCityViewImageUrl(
  location: LocationData,
  viewType: 'satellite' | 'map' | 'streetview' = 'map',
  width = 800,
  height = 600
): string {
  switch (viewType) {
    case 'satellite':
      return getOpenStreetMapSatelliteUrl(location, width, height);
    case 'streetview':
      return getOpenStreetMapStreetViewUrl(location, width, height);
    case 'map':
    default:
      return getOpenStreetMapStandardUrl(location, width, height);
  }
}

// Cache untuk menyimpan URL gambar yang sudah diambil
const imageUrlCache = new Map<string, string>();

/**
 * Mendapatkan URL gambar dari cache atau menghasilkan yang baru
 */
export function getCachedCityViewImageUrl(
  location: LocationData,
  viewType: 'satellite' | 'map' | 'streetview' = 'map'
): string {
  const cacheKey = `${location.lat},${location.lon}-${viewType}`;

  if (imageUrlCache.has(cacheKey)) {
    return imageUrlCache.get(cacheKey) as string;
  }

  const imageUrl = getCityViewImageUrl(location, viewType);
  imageUrlCache.set(cacheKey, imageUrl);
  return imageUrl;
}

/**
 * Mendapatkan multiple URLs untuk fallback
 */
export function getCityViewImageUrls(
  location: LocationData,
  viewType: 'satellite' | 'map' | 'streetview' = 'map'
): string[] {
  return [
    getReliablePlaceholderUrl(location, viewType), // Langsung gunakan placeholder yang reliable
  ];
}

/**
 * Validasi apakah URL gambar dapat diakses
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
