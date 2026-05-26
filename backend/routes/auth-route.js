import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[AUTH-ROUTE] Module chargé et routeur créé');

const usersFile = path.join(__dirname, '../data/users.json');
const dataDir = path.join(__dirname, '../data');

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Créer le répertoire data s'il n'existe pas
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Lire les utilisateurs
function readUsers() {
  try {
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erreur lors de la lecture des utilisateurs:', err);
  }
  return [];
}

// Écrire les utilisateurs
function writeUsers(users) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Erreur lors de l\'écriture des utilisateurs:', err);
  }
}

// Générer les tokens
function generateTokens(userId, email) {
  const accessToken = jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, email },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

// POST - Inscription
router.post('/signup', async (req, res) => {
  try {
    console.log('[AUTH] POST /signup appelé');
    console.log('[AUTH] req.body:', req.body);
    const { email, password } = req.body;

    console.log('[AUTH] Email reçu:', email);
    console.log('[AUTH] Password reçu:', password ? '***' : 'UNDEFINED');

    // Validation
    if (!email || !password) {
      console.log('[AUTH] ❌ Email ou password manquant');
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    if (password.length < 6) {
      console.log('[AUTH] ❌ Password trop court:', password.length);
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const users = readUsers();
    console.log('[AUTH] Nombre d\'utilisateurs existants:', users.length);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log('[AUTH] ❌ Email déjà utilisé:', email);
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    console.log('[AUTH] ✅ Email disponible');

    // Hasher le mot de passe avec un sel
    console.log('[AUTH] Hachage du mot de passe...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[AUTH] ✅ Mot de passe haché');

    // Créer le nouvel utilisateur
    const newUser = {
      userId: Date.now().toString(),
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    console.log('[AUTH] ✅ Utilisateur ajouté en mémoire');
    
    writeUsers(users);
    console.log('[AUTH] ✅ Utilisateur sauvegardé');

    // Générer les tokens
    console.log('[AUTH] Génération des tokens...');
    const { accessToken, refreshToken } = generateTokens(newUser.userId, email);
    console.log('[AUTH] ✅ Tokens générés');

    // Sauvegarder le refresh token (optionnel, pour la révocation)
    const tokensFile = path.join(__dirname, '../data/tokens.json');
    let tokens = [];
    if (fs.existsSync(tokensFile)) {
      tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
    }
    tokens.push({
      userId: newUser.userId,
      refreshToken,
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2), 'utf8');

    console.log('[AUTH] Envoi de la réponse de succès');
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      userId: newUser.userId,
      email,
      accessToken,
      refreshToken
    });
    console.log('[AUTH] ✅ Inscription réussie pour:', email);
  } catch (error) {
    console.error('[AUTH] ❌ Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur: ' + error.message });
  }
});

// POST - Connexion
router.post('/login', async (req, res) => {
  try {
    console.log('[AUTH] POST /login appelé');
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const users = readUsers();

    // Trouver l'utilisateur
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user.userId, email);

    // Sauvegarder le refresh token
    const tokensFile = path.join(__dirname, '../data/tokens.json');
    let tokens = [];
    if (fs.existsSync(tokensFile)) {
      tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
    }
    tokens.push({
      userId: user.userId,
      refreshToken,
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2), 'utf8');

    res.json({
      message: 'Connexion réussie',
      userId: user.userId,
      email,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST - Refresh token
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token requis' });
    }

    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Générer un nouveau access token
    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('Erreur lors du refresh:', error);
    res.status(401).json({ message: 'Refresh token invalide ou expiré' });
  }
});

// POST - Logout (optionnel, révoque le refresh token)
router.post('/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const tokensFile = path.join(__dirname, '../data/tokens.json');
      if (fs.existsSync(tokensFile)) {
        let tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
        tokens = tokens.filter(t => t.refreshToken !== refreshToken);
        fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2), 'utf8');
      }
    }

    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Middleware pour vérifier le token
export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

export default router;
