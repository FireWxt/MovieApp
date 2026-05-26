import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';
import trendingRoute from './routes/trending-route.js';
import genreRoute from './routes/genre-route.js';
import genresRoute from './routes/genres-route.js';
import moviesRoute from './routes/movies-route.js';
import watchlistRoute from './routes/watchlist-route.js';
import authRoute from './routes/auth-route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Configuration CORS explicite
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logger TOUTES les requêtes (AVANT les routes)
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.path}`);
  next();
});

console.log('[SERVER] Enregistrement des routes API...');
console.log('[SERVER] Type de authRoute:', typeof authRoute);
console.log('[SERVER] authRoute est défini:', !!authRoute);

// Route de test
app.get('/api/test', (req, res) => {
  console.log('[SERVER] GET /api/test appelé - LE SERVEUR REÇOIT LES REQUÊTES!');
  res.json({ message: 'Le serveur fonctionne!' });
});

app.use('/api/auth', authRoute);
console.log('[SERVER] ✅ Route /api/auth enregistrée');
app.use('/api/movies/trending', trendingRoute);
app.use('/api/movies/genre', genreRoute);
app.use('/api/genres', genresRoute);
app.use('/api/movies', moviesRoute);
app.use('/api/watchlists', watchlistRoute);
console.log('[SERVER] ✅ Toutes les routes API enregistrées');

// Servir les fichiers statiques du répertoire Angular (s'ils existent)
const staticPath = path.join(__dirname, '../movie-app-angular/dist/movie-app-angular/browser');
if (fs.existsSync(staticPath)) {
  console.log('[SERVER] Dossier dist trouvé, servage des fichiers statiques');
  app.use(express.static(staticPath));
  
  // Rediriger les requêtes non-API vers l'application Angular
  app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
      console.log('[SERVER] Redirection Angular pour:', req.path);
      res.sendFile(path.join(staticPath, 'index.html'));
    } else {
      res.status(404).json({ message: 'Route API non trouvée' });
    }
  });
} else {
  // Si l'application Angular n'est pas compilée
  console.log('[SERVER] ⚠️ Dossier dist NOT trouvé - Mode développement');
  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      // Les routes API devraient avoir matché plus haut
      res.status(404).json({ message: 'Route API non trouvée: ' + req.path });
    } else {
      res.status(200).json({ message: 'API MovieApp en ligne. Utilisez http://localhost:4200 pour Angular' });
    }
  });
}

app.listen(port, () => {
  console.log(`\n✅ Serveur démarré sur http://localhost:${port}`);
  console.log(`✅ Routes API disponibles :`);
  console.log(`   - POST http://localhost:${port}/api/auth/signup`);
  console.log(`   - POST http://localhost:${port}/api/auth/login`);
  console.log(`   - GET http://localhost:${port}/api/watchlists`);
  console.log(`\n`);
});