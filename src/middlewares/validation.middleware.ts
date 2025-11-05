import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Middleware de validation générique
 * Valide les données de la requête selon un schéma Joi
 * 
 * @param schema - Schéma Joi de validation
 * @param property - Propriété de la requête à valider ('body', 'query', 'params')
 * @returns Middleware Express
 */
export const validate = (
  schema: Joi.ObjectSchema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Retourner toutes les erreurs, pas seulement la première
      stripUnknown: true // Supprimer les propriétés non définies dans le schéma
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
      return;
    }

    // Remplacer les données de la requête par les données validées
    req[property] = value;
    next();
  };
};

/**
 * Schémas de validation pour l'authentification
 */
export const authValidation = {
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.min': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
        'string.max': 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères',
        'any.required': 'Le nom d\'utilisateur est obligatoire'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Veuillez fournir un email valide',
        'any.required': 'L\'email est obligatoire'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
        'any.required': 'Le mot de passe est obligatoire'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Veuillez fournir un email valide',
        'any.required': 'L\'email est obligatoire'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Le mot de passe est obligatoire'
      })
  })
};

/**
 * Schémas de validation pour les jeux
 */
export const gameValidation = {
  create: Joi.object({
    title: Joi.string()
      .min(2)
      .max(200)
      .required(),
    description: Joi.string()
      .min(10)
      .max(2000)
      .required(),
    genre: Joi.string()
      .valid('Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Simulation', 'Horror', 'Puzzle', 'Fighting', 'Platformer', 'MMORPG')
      .required(),
    platform: Joi.array()
      .items(Joi.string())
      .min(1)
      .required(),
    releaseYear: Joi.number()
      .integer()
      .min(1970)
      .max(new Date().getFullYear() + 2)
      .required(),
    publisher: Joi.string()
      .required(),
    rating: Joi.number()
      .min(0)
      .max(10)
      .default(0),
    price: Joi.number()
      .min(0)
      .default(0),
    inStock: Joi.boolean()
      .default(true)
  }),

  update: Joi.object({
    title: Joi.string()
      .min(2)
      .max(200),
    description: Joi.string()
      .min(10)
      .max(2000),
    genre: Joi.string()
      .valid('Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Simulation', 'Horror', 'Puzzle', 'Fighting', 'Platformer', 'MMORPG'),
    platform: Joi.array()
      .items(Joi.string())
      .min(1),
    releaseYear: Joi.number()
      .integer()
      .min(1970)
      .max(new Date().getFullYear() + 2),
    publisher: Joi.string(),
    rating: Joi.number()
      .min(0)
      .max(10),
    price: Joi.number()
      .min(0),
    inStock: Joi.boolean()
  }).min(1) // Au moins un champ doit être fourni
};

