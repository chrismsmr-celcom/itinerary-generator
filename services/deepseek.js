const axios = require('axios');

/**
 * Construit le prompt système envoyé à DeepSeek.
 * On force une sortie JSON stricte pour pouvoir la parser sans ambiguïté.
 */
function buildSystemPrompt() {
  return `Tu es un expert en création d'itinéraires de voyage pour des agences.
Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, sans balises markdown.

Le format attendu est exactement :
{
  "destination": "string",
  "duration_days": number,
  "summary": "string (2-3 phrases d'intro)",
  "days": [
    {
      "day_number": number,
      "title": "string (titre court de la journée)",
      "stops": [
        {
          "name": "string (nom du lieu)",
          "description": "string (1-2 phrases)",
          "latitude": number,
          "longitude": number,
          "time_of_day": "matin | après-midi | soir",
          "estimated_cost": "string (ex: '20-30 USD' ou 'Gratuit')"
        }
      ]
    }
  ],
  "budget_estimate_total": "string",
  "practical_tips": ["string", "string"]
}

Règles :
- Utilise des coordonnées GPS réalistes et précises pour chaque lieu.
- Adapte le nombre d'arrêts par jour au budget et au rythme demandés.
- Si une contrainte d'accessibilité est mentionnée, choisis des lieux compatibles et le signaler dans la description.
- Reste concis mais concret (pas de généralités vagues).`;
}

function buildUserPrompt({ destination, days, budget, interests, constraints, travelerProfile }) {
  const parts = [
    `Destination : ${destination}`,
    `Durée : ${days} jours`,
  ];
  if (budget) parts.push(`Budget : ${budget}`);
  if (interests?.length) parts.push(`Centres d'intérêt : ${interests.join(', ')}`);
  if (travelerProfile) parts.push(`Profil voyageur : ${travelerProfile}`);
  if (constraints) parts.push(`Contraintes particulières : ${constraints}`);
  parts.push('Génère l\'itinéraire au format JSON demandé.');
  return parts.join('\n');
}

/**
 * Appelle l'API DeepSeek et retourne l'itinéraire déjà parsé en objet JS.
 * Lève une erreur explicite si la réponse n'est pas un JSON valide.
 */
async function generateItinerary(params) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY manquant dans les variables d\'environnement');
  }

  const response = await axios.post(
    apiUrl,
    {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(params) },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  const raw = response.data?.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error('Réponse DeepSeek vide ou mal formée');
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    // Filet de sécurité : DeepSeek respecte généralement response_format json_object,
    // mais on nettoie au cas où un modèle renverrait des ```json``` autour.
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

module.exports = { generateItinerary };
