require('dotenv').config();
const express = require('express');
const cors = require('cors');
const itineraryRoutes = require('./routes/itinerary');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/', itineraryRoutes);

// ✅ Render utilise la variable d'environnement PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Itinerary generator API en écoute sur le port ${PORT}`);
});