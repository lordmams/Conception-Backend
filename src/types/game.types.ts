import { Document, Types } from 'mongoose';

/**
 * Interface représentant un jeu vidéo
 */
export interface IGame {
  title: string;
  description: string;
  genre: string;
  platform: string[];
  releaseYear: number;
  publisher: string;
  rating: number;
  price: number;
  inStock: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface pour le document Mongoose (IGame + méthodes Mongoose)
 */
export interface IGameDocument extends IGame, Document {
  _id: Types.ObjectId;
}

/**
 * Interface pour les filtres de recherche
 */
export interface IGameSearchFilters {
  keyword?: string;
  genre?: string;
  platform?: string;
  minRating?: number;
  maxPrice?: number;
  inStock?: boolean;
  minYear?: number;
  maxYear?: number;
}

/**
 * Interface pour les options de pagination
 */
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface pour la réponse paginée
 */
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

