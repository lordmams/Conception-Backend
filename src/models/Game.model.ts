import mongoose, { Schema } from 'mongoose';
import { IGameDocument } from '../types/game.types';

/**
 * Schéma Mongoose pour un jeu vidéo
 */
const GameSchema = new Schema<IGameDocument>(
  {
    title: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true,
      minlength: [2, 'Le titre doit contenir au moins 2 caractères'],
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
    },
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
      trim: true,
      minlength: [10, 'La description doit contenir au moins 10 caractères'],
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
    },
    genre: {
      type: String,
      required: [true, 'Le genre est obligatoire'],
      enum: {
        values: ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Simulation', 'Horror', 'Puzzle', 'Fighting', 'Platformer', 'MMORPG'],
        message: 'Genre non valide'
      }
    },
    platform: {
      type: [String],
      required: [true, 'Au moins une plateforme est requise'],
      validate: {
        validator: function(platforms: string[]) {
          return platforms.length > 0;
        },
        message: 'Au moins une plateforme doit être spécifiée'
      }
    },
    releaseYear: {
      type: Number,
      required: [true, 'L\'année de sortie est obligatoire'],
      min: [1970, 'L\'année de sortie doit être >= 1970'],
      max: [new Date().getFullYear() + 2, 'L\'année de sortie semble invalide']
    },
    publisher: {
      type: String,
      required: [true, 'L\'éditeur est obligatoire'],
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'La note est obligatoire'],
      min: [0, 'La note doit être entre 0 et 10'],
      max: [10, 'La note doit être entre 0 et 10'],
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Le prix est obligatoire'],
      min: [0, 'Le prix ne peut pas être négatif'],
      default: 0
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index pour améliorer les performances de recherche
GameSchema.index({ title: 'text', description: 'text' });
GameSchema.index({ genre: 1 });
GameSchema.index({ rating: -1 });
GameSchema.index({ releaseYear: -1 });

/**
 * Model Mongoose pour Game
 */
export const GameModel = mongoose.model<IGameDocument>('Game', GameSchema);

