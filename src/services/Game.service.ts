import { GameModel } from '../models/Game.model';
import { IGame, IGameDocument, IGameSearchFilters, IPaginationOptions, IPaginatedResponse } from '../types/game.types';
import { FilterQuery } from 'mongoose';

/**
 * Service pour la gestion de la logique métier des jeux vidéo
 */
export class GameService {
  /**
   * Crée un nouveau jeu
   */
  public async create(gameData: IGame): Promise<IGameDocument> {
    try {
      const game = new GameModel(gameData);
      const savedGame = await game.save();
      return savedGame;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la création du jeu: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Récupère un jeu par son ID
   */
  public async findById(id: string): Promise<IGameDocument | null> {
    try {
      const game = await GameModel.findById(id);
      return game;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la récupération du jeu: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Récupère tous les jeux avec pagination optionnelle
   */
  public async list(options: IPaginationOptions = {}): Promise<IPaginatedResponse<IGameDocument>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [data, totalItems] = await Promise.all([
        GameModel.find().sort(sortOptions).skip(skip).limit(limit),
        GameModel.countDocuments()
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la récupération de la liste: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Recherche des jeux avec filtres multiples
   * - keyword: recherche dans title et description (insensible à la casse)
   * - genre: filtre exact sur le genre
   * - platform: filtre sur la plateforme
   * - minRating: note minimale
   * - maxPrice: prix maximum
   * - inStock: disponibilité
   * - minYear/maxYear: fourchette d'années
   */
  public async search(
    filters: IGameSearchFilters,
    options: IPaginationOptions = {}
  ): Promise<IPaginatedResponse<IGameDocument>> {
    try {
      const {
        keyword,
        genre,
        platform,
        minRating,
        maxPrice,
        inStock,
        minYear,
        maxYear
      } = filters;

      const {
        page = 1,
        limit = 10,
        sortBy = 'rating',
        sortOrder = 'desc'
      } = options;

      // Construction de la requête MongoDB
      const query: FilterQuery<IGameDocument> = {};

      // Recherche par mot-clé sur title et description (insensible à la casse)
      if (keyword && keyword.trim() !== '') {
        query.$or = [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ];
      }

      // Filtre par genre (exact match, insensible à la casse)
      if (genre) {
        query.genre = { $regex: `^${genre}$`, $options: 'i' };
      }

      // Filtre par plateforme
      if (platform) {
        query.platform = { $in: [new RegExp(platform, 'i')] };
      }

      // Filtre par note minimale
      if (minRating !== undefined && minRating !== null) {
        query.rating = { ...query.rating, $gte: minRating };
      }

      // Filtre par prix maximum
      if (maxPrice !== undefined && maxPrice !== null) {
        query.price = { $lte: maxPrice };
      }

      // Filtre par disponibilité
      if (inStock !== undefined && inStock !== null) {
        query.inStock = inStock;
      }

      // Filtre par année de sortie (fourchette)
      if (minYear !== undefined && minYear !== null) {
        query.releaseYear = { ...query.releaseYear, $gte: minYear };
      }
      if (maxYear !== undefined && maxYear !== null) {
        query.releaseYear = { ...query.releaseYear, $lte: maxYear };
      }

      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [data, totalItems] = await Promise.all([
        GameModel.find(query).sort(sortOptions).skip(skip).limit(limit),
        GameModel.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la recherche: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Met à jour un jeu
   */
  public async update(id: string, gameData: Partial<IGame>): Promise<IGameDocument | null> {
    try {
      const updatedGame = await GameModel.findByIdAndUpdate(
        id,
        { $set: gameData },
        { new: true, runValidators: true }
      );
      return updatedGame;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Supprime un jeu
   */
  public async delete(id: string): Promise<IGameDocument | null> {
    try {
      const deletedGame = await GameModel.findByIdAndDelete(id);
      return deletedGame;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la suppression: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Compte le nombre total de jeux
   */
  public async count(): Promise<number> {
    try {
      return await GameModel.countDocuments();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors du comptage: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Récupère les genres disponibles
   */
  public async getAvailableGenres(): Promise<string[]> {
    try {
      const genres = await GameModel.distinct('genre');
      return genres;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la récupération des genres: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Récupère les plateformes disponibles
   */
  public async getAvailablePlatforms(): Promise<string[]> {
    try {
      const platforms = await GameModel.distinct('platform');
      return platforms;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la récupération des plateformes: ${error.message}`);
      }
      throw error;
    }
  }
}

