import proj4 from 'proj4';

export function convertUtmToLatLon(x, y, zone) {
  if (!x || !y || isNaN(x) || isNaN(y)) return { lat: null, lng: null };
  const numZone = parseInt(zone, 10) || 48;
  const utmProj = `+proj=utm +zone=${numZone} +datum=WGS84 +units=m +no_defs`;
  const wgs84Proj = '+proj=longlat +datum=WGS84 +no_defs';
  
  try {
    const [lng, lat] = proj4(utmProj, wgs84Proj, [Number(x), Number(y)]);
    if (lat > 5 && lat < 21 && lng > 97 && lng < 106) {
      return { lat, lng };
    }
  } catch (e) {
    // Ignore invalid coords
  }
  return { lat: null, lng: null };
}

export const HUAIRACH_CENTER = [14.9925, 103.2650]; // Approx center of Huai Ratch district, Buriram
export const HUAIRACH_ZOOM = 12;
