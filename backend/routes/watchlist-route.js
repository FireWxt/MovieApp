import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const watchlistsFile = path.join(__dirname, '../data/watchlists.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Créer le répertoire data s'il n'existe pas
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware de vérification du token JWT
function verifyToken(req, res, next) {
  console.log('[WATCHLIST] Vérification du token...');
  console.log('[WATCHLIST] Headers reçus:', req.headers);
  const authHeader = req.headers.authorization;
  console.log('[WATCHLIST] Authorization header:', authHeader);
  
  const token = authHeader?.split(' ')[1];

  if (!token) {
    console.log('[WATCHLIST] ❌ Token manquant');
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    console.log('[WATCHLIST] Vérification du token avec JWT_SECRET');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('[WATCHLIST] ✅ Token vérifié pour userId:', decoded.userId);
    next();
  } catch (error) {
    console.log('[WATCHLIST] ❌ Token invalide:', error.message);
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

// Lire les watchlists depuis le fichier
function readWatchlists() {
  try {
    if (fs.existsSync(watchlistsFile)) {
      const data = fs.readFileSync(watchlistsFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erreur lors de la lecture des watchlists:', err);
  }
  return [];
}

// Écrire les watchlists dans le fichier
function writeWatchlists(watchlists) {
  try {
    fs.writeFileSync(watchlistsFile, JSON.stringify(watchlists, null, 2), 'utf8');
  } catch (err) {
    console.error('Erreur lors de l\'écriture des watchlists:', err);
  }
}

// GET - Récupérer toutes les watchlists de l'utilisateur
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.userId;
  console.log('[WATCHLIST GET] userId:', userId);
  const watchlists = readWatchlists();
  const userWatchlists = watchlists.filter(w => w.userId === userId);
  console.log('[WATCHLIST GET] Toutes les watchlists:', watchlists.length, 'Watchlists de l\'utilisateur:', userWatchlists.length);
  res.json(userWatchlists);
});

// GET - Récupérer une watchlist spécifique par ID
router.get('/:id', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const watchlists = readWatchlists();
  const watchlist = watchlists.find(w => w.id === req.params.id && w.userId === userId);
  
  if (!watchlist) {
    return res.status(404).json({ message: 'Watchlist non trouvée' });
  }
  
  res.json(watchlist);
});

// POST - Créer une nouvelle watchlist
router.post('/', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Le nom de la watchlist est requis' });
  }
  
  const watchlists = readWatchlists();
  const newWatchlist = {
    id: Date.now().toString(),
    userId,
    name,
    movies: [],
    createdAt: new Date().toISOString()
  };
  
  watchlists.push(newWatchlist);
  writeWatchlists(watchlists);
  
  res.status(201).json(newWatchlist);
});

// POST - Ajouter un film à une watchlist
router.post('/:id/movies', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const { movie } = req.body;
  
  if (!movie) {
    return res.status(400).json({ message: 'Le film est requis' });
  }
  
  const watchlists = readWatchlists();
  const watchlist = watchlists.find(w => w.id === req.params.id && w.userId === userId);
  
  if (!watchlist) {
    return res.status(404).json({ message: 'Watchlist non trouvée' });
  }
  
  // Vérifier si le film n'est pas déjà dans la watchlist
  const movieExists = watchlist.movies.some(m => m.id === movie.id);
  if (movieExists) {
    return res.status(400).json({ message: 'Le film est déjà dans cette watchlist' });
  }
  
  watchlist.movies.push({
    ...movie,
    addedAt: new Date().toISOString()
  });
  
  writeWatchlists(watchlists);
  res.status(201).json(watchlist);
});

// DELETE - Supprimer un film d'une watchlist
router.delete('/:id/movies/:movieId', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const watchlists = readWatchlists();
  const watchlist = watchlists.find(w => w.id === req.params.id && w.userId === userId);
  
  if (!watchlist) {
    return res.status(404).json({ message: 'Watchlist non trouvée' });
  }
  
  const movieIndex = watchlist.movies.findIndex(m => m.id === parseInt(req.params.movieId));
  
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Film non trouvé dans cette watchlist' });
  }
  
  watchlist.movies.splice(movieIndex, 1);
  writeWatchlists(watchlists);
  
  res.json(watchlist);
});

// DELETE - Supprimer une watchlist complète
router.delete('/:id', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const watchlists = readWatchlists();
  const watchlistIndex = watchlists.findIndex(w => w.id === req.params.id && w.userId === userId);
  
  if (watchlistIndex === -1) {
    return res.status(404).json({ message: 'Watchlist non trouvée' });
  }
  
  const deletedWatchlist = watchlists.splice(watchlistIndex, 1);
  writeWatchlists(watchlists);
  
  res.json({ message: 'Watchlist supprimée', watchlist: deletedWatchlist[0] });
});

// PUT - Modifier le nom d'une watchlist
router.put('/:id', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Le nom de la watchlist est requis' });
  }
  
  const watchlists = readWatchlists();
  const watchlist = watchlists.find(w => w.id === req.params.id && w.userId === userId);
  
  if (!watchlist) {
    return res.status(404).json({ message: 'Watchlist non trouvée' });
  }
  
  watchlist.name = name;
  writeWatchlists(watchlists);
  
  res.json(watchlist);
});

export default router;
