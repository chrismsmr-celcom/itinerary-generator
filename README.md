# Générateur d'itinéraires en marque blanche

API backend qui génère un itinéraire de voyage personnalisé (via DeepSeek) et le retourne
en PDF prêt à l'emploi, avec une carte Mapbox intégrée et le branding de l'agence cliente.

## Installation

```bash
npm install
cp .env.example .env
# puis remplir DEEPSEEK_API_KEY et MAPBOX_API_KEY dans .env
npm start
```

## Utilisation

```
POST /generate-itinerary
Content-Type: application/json

{
  "destination": "Kinshasa",
  "days": 3,
  "budget": "moyen",
  "interests": ["gastronomie locale", "culture"],
  "constraints": "accessible en fauteuil roulant",
  "travelerProfile": "couple",
  "agencyBranding": {
    "logoUrl": "https://exemple.com/logo.png",
    "primaryColor": "#1d3557"
  },
  "format": "pdf"
}
```

- `format: "pdf"` (défaut) → renvoie directement le fichier PDF en téléchargement.
- `format: "json"` → renvoie l'itinéraire brut (utile pour un futur front, ou pour debug).

`GET /health` → vérifie que le serveur tourne.

## Structure

```
server.js              point d'entrée Express
routes/itinerary.js     route POST /generate-itinerary, orchestre le flux
services/deepseek.js     appel DeepSeek + parsing JSON structuré
services/mapbox.js       génère l'URL de carte statique (pins numérotés par jour)
services/pdf.js          rend le template HTML et le convertit en PDF (Puppeteer)
templates/itinerary.hbs  template Handlebars, personnalisable (logo + couleur agence)
```

## Marque blanche

Chaque agence peut passer son `logoUrl` et sa `primaryColor` dans `agencyBranding` —
le PDF s'adapte automatiquement (header, badges de jour, tracé de couleur).

## Prochaines étapes suggérées

- Ajouter le tracé (polyline) reliant les arrêts sur la carte, pas seulement les pins
  (voir note dans `services/mapbox.js`).
- Cache des itinéraires générés (même destination + mêmes contraintes) pour réduire les
  coûts d'appel DeepSeek.
- Authentification par clé API par agence cliente (pour facturer/limiter l'usage).
- Petit front de démo (formulaire + prévisualisation carte avant export PDF).
