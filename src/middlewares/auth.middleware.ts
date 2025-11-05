import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { IJwtPayload, UserRole } from '../types/auth.types';

/**
 * Extension de l'interface Request pour inclure l'utilisateur authentifié
 */
export interface AuthRequest extends Request {
  user?: IJwtPayload;
}

/**
 * Middleware d'authentification JWT
 * Vérifie la présence et la validité du token JWT dans le header Authorization
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
      return;
    }

    // Extraire le token (format: "Bearer TOKEN")
    const token = authHeader.substring(7);

    // Vérifier et décoder le token
    const decoded = verifyToken(token);

    // Ajouter l'utilisateur décodé à la requête
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

/**
 * Middleware d'autorisation par rôle
 * Vérifie que l'utilisateur a le bon rôle pour accéder à la ressource
 * 
 * @param roles - Liste des rôles autorisés
 * @returns Middleware Express
 * 
 * @example
 * router.delete('/games/:id', authenticate, authorize([UserRole.ADMIN]), gameController.delete);
 */
export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Vous devez être authentifié pour accéder à cette ressource'
      });
      return;
    }

    // Vérifier que l'utilisateur a le bon rôle
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource',
        requiredRoles: roles,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware optionnel d'authentification
 * Ajoute l'utilisateur à la requête s'il est authentifié, mais ne bloque pas sinon
 */
export const optionalAuthenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Ignorer les erreurs, c'est optionnel
  }

  next();
};

