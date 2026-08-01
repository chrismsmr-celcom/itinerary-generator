/**
 * Construit une URL Mapbox Static Images avec un pin numéroté par arrêt
 * (couleur différente par jour) et un tracé reliant les points dans l'ordre.
 *
 * Doc Mapbox Static Images API :
 * https://docs.mapbox.com/api/maps/static-images/
 */

const DAY_COLORS = ['e63946', '2a9d8f', 'e9c46a', '264653', '9d4edd', 'f4a261'];

function buildStaticMapUrl(itinerary, { width = 1200, height = 700 } = {}) {
  const apiKey = process.env.MAPBOX_API_KEY;
  if (!apiKey) {
    throw new Error('MAPBOX_API_KEY manquant dans les variables d\'environnement');
  }

  const allStops = [];
  itinerary.days.forEach((day, dayIndex) => {
    day.stops.forEach((stop, stopIndex) => {
      allStops.push({
        ...stop,
        dayIndex,
        label: String(stopIndex + 1),
        color: DAY_COLORS[dayIndex % DAY_COLORS.length],
      });
    });
  });

  if (allStops.length === 0) {
    throw new Error('Aucun arrêt à afficher sur la carte');
  }

  // Un marker par arrêt : pin-s-<label>+<color>(lon,lat)
  const markers = allStops
    .map((s) => `pin-s-${s.label}+${s.color}(${s.longitude},${s.latitude})`)
    .join(',');

  // NOTE évolution possible : ajouter un tracé reliant les arrêts en encodant
  // un overlay path-N+COLOR(polyline_encodée) devant les markers dans l'URL,
  // ou en passant un objet GeoJSON encodé en URI. Laissé de côté pour le MVP
  // (le PDF montre déjà l'ordre via la numérotation des pins et la liste des jours).

  const base = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markers}/auto/${width}x${height}@2x`;
  const url = `${base}?padding=60&access_token=${apiKey}`;

  return url;
}

module.exports = { buildStaticMapUrl };
