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

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/movies/trending', trendingRoute);
app.use('/api/movies/genre', genreRoute);
app.use('/api/genres', genresRoute);
app.use('/api/movies', moviesRoute);
app.use('/api/watchlists', watchlistRoute);

// Servir les fichiers statiques du répertoire Angular (s'ils existent)
const staticPath = path.join(__dirname, '../movie-app-angular/dist/movie-app-angular/browser');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  
  // Rediriger toutes les autres requêtes vers l'application Angular
  app.use((req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // Si l'application Angular n'est pas compilée, renvoyer un message d'erreur
  app.use((req, res) => {
    res.status(200).json({ 
      message: 'API MovieApp en ligne. L\'application Angular doit être compilée avec "ng build"' 
    });
  });
}

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});