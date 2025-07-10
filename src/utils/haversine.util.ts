/**
 * Calculates the distance between two points on the Earth's surface using the Haversine formula.
 * @param lat1 Latitude of the first point in decimal degrees
 * @param lon1 Longitude of the first point in decimal degrees
 * @param lat2 Latitude of the second point in decimal degrees
 * @param lon2 Longitude of the second point in decimal degrees
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // Earth's radius in meters
  const R = 6371e3;

  // Convert latitude and longitude from degrees to radians
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Checks if a user is within the specified distance of their office.
 * @param userLat User's current latitude
 * @param userLon User's current longitude
 * @param officeLat Office's latitude
 * @param officeLon Office's longitude
 * @param maxDistance Maximum allowed distance in meters (default: 50)
 * @returns Boolean indicating whether the user is within the allowed distance
 */
export function isWithinDistance(
  userLat: number,
  userLon: number,
  officeLat: number,
  officeLon: number,
  maxDistance: number = 50,
): boolean {
  const distance = calculateDistance(userLat, userLon, officeLat, officeLon);
  return distance <= maxDistance;
}
