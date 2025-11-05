import jwt from 'jsonwebtoken';
import { IJwtPayload } from '../types/auth.types';

/**
 * Clé secrète pour signer les tokens JWT
 * En production, utiliser une vraie clé secrète dans les variables d'environnement
 */
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète_super_sécurisée_changez_moi_en_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Génère un token JWT
 */
export const generateToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Vérifie et décode un token JWT
 */
export const verifyToken = (token: string): IJwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as IJwtPayload;
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};

/**
 * Décode un token sans vérifier la signature (pour debug)
 */
export const decodeToken = (token: string): IJwtPayload | null => {
  try {
    return jwt.decode(token) as IJwtPayload;
  } catch (error) {
    return null;
  }
};

