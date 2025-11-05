import rateLimit from 'express-rate-limit';

/**
 * Limiteur de taux général pour toutes les routes
 * 100 requêtes par 15 minutes par IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard'
  },
  standardHeaders: true, // Retourner les infos de rate limit dans les headers `RateLimit-*`
  legacyHeaders: false // Désactiver les headers `X-RateLimit-*`
});

/**
 * Limiteur strict pour les routes d'authentification
 * 5 tentatives par 15 minutes par IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite de 5 tentatives
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Ne compter que les requêtes échouées
});

/**
 * Limiteur pour les routes de création (POST)
 * 20 créations par heure par IP
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20,
  message: {
    success: false,
    message: 'Trop de créations, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Limiteur pour les routes de recherche
 * 50 requêtes par 10 minutes par IP
 */
export const searchLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50,
  message: {
    success: false,
    message: 'Trop de recherches, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false
});

