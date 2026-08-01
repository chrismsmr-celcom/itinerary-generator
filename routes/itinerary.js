const express = require('express');
const { generateItinerary } = require('../services/deepseek');
const { buildStaticMapUrl } = require('../services/mapbox');
const { renderItineraryPdf } = require('../services/pdf');

const router = express.Router();

/**
 * POST /generate-itinerary
 * Body attendu :
 * {
 *   "destination": "Kinshasa",
 *   "days": 3,
 *   "budget": "moyen",
 *   "interests": ["gastronomie locale", "culture"],
 *   "constraints": "accessible en fauteuil roulant",
 *   "travelerProfile": "couple",
 *   "agencyBranding": { "logoUrl": "https://...", "primaryColor": "#1d3557" },
 *   "format": "pdf" | "json"   (défaut: "pdf")
 * }
 */
router.post('/generate-itinerary', async (req, res) => {
  const {
    destination,
    days,
    budget,
    interests,
    constraints,
    travelerProfile,
    agencyBranding,
    format = 'pdf',
  } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ error: 'Les champs "destination" et "days" sont obligatoires.' });
  }

  try {
    const itinerary = await generateItinerary({
      destination,
      days,
      budget,
      interests,
      constraints,
      travelerProfile,
    });

    if (format === 'json') {
      return res.json({ itinerary });
    }

    const mapImageUrl = buildStaticMapUrl(itinerary);
    const pdfBuffer = await renderItineraryPdf(itinerary, mapImageUrl, agencyBranding);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="itineraire-${destination.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
    });
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('[generate-itinerary] erreur:', err.message);
    return res.status(500).json({ error: 'Échec de la génération de l\'itinéraire', detail: err.message });
  }
});

module.exports = router;
