export interface Coordinate {
  latitude: number;
  longitude: number;
}

export function getDistanceBetweenCoordinates(
  from: Coordinate,
  to: Coordinate,
): number {
  const earthRadiusInKilometers = 6371;

  const latitudeDistanceInRadians = toRadians(to.latitude - from.latitude);
  const longitudeDistanceInRadians = toRadians(to.longitude - from.longitude);

  const haversineFormula =
    Math.sin(latitudeDistanceInRadians / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeDistanceInRadians / 2) ** 2;

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversineFormula), Math.sqrt(1 - haversineFormula));

  return earthRadiusInKilometers * angularDistance;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
