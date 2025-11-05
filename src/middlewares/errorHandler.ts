import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

/**
 * Interface pour les erreurs personnalisées
 */
interface ICustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: any;
  errors?: any;
}

/**
 * Middleware de gestion centralisée des erreurs
 */
export const errorHandler = (
  error: ICustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Erreur capturée:', error);

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erreur interne du serveur';
  let errors: any = undefined;

  // Erreur de validation Mongoose
  if (error instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = 'Erreur de validation';
    errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message
    }));
  }

  // Détecter les erreurs de validation wrappées par le service
  if (error.message && error.message.includes('validation failed')) {
    statusCode = 400;
    message = error.message;
  }

  // Erreur de cast Mongoose (ID invalide)
  if (error.name === 'CastError' || (error.message && error.message.includes('Cast to ObjectId failed'))) {
    statusCode = 400;
    message = 'ID invalide';
  }

  // Erreur de clé dupliquée (index unique)
  if (error.code === 11000) {
    statusCode = 409;
    message = 'Cette ressource existe déjà';
    const field = Object.keys(error.keyValue || {})[0];
    errors = [{
      field: field,
      message: `La valeur "${error.keyValue?.[field]}" existe déjà`
    }];
  }

  // Réponse JSON standardisée
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * Middleware pour les routes non trouvées
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`
  });
};

