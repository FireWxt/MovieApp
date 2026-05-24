import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import trendingRoute from './routes/trending-route.js';
import genreRoute from './routes/genre-route.js';
import genresRoute from './routes/genres-route.js';
import moviesRoute from './routes/movies-route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/movies/trending', trendingRoute);
app.use('/api/movies/genre', genreRoute);
app.use('/api/genres', genresRoute);
app.use('/api/movies', moviesRoute);

// Servir les fichiers statiques du répertoire Angular
app.use(express.static(path.join(__dirname, '../movie-app-angular/dist/movie-app-angular/browser')));

// Rediriger toutes les autres requêtes vers l'application Angular
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../movie-app-angular/dist/movie-app-angular/browser/index.html'));
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});