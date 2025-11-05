import { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/Game.service';
import { IGame, IGameSearchFilters, IPaginationOptions } from '../types/game.types';

/**
 * Controller pour gérer les requêtes HTTP liées aux jeux
 * Responsabilité: orchestration requêtes/réponses (pas de logique métier)
 */
export class GameController {
  private gameService: GameService;

  constructor() {
    this.gameService = new GameService();
  }

  /**
   * POST /games - Crée un nouveau jeu
   */
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const gameData: IGame = req.body;
      const newGame = await this.gameService.create(gameData);
      
      res.status(201).json({
        success: true,
        message: 'Jeu créé avec succès',
        data: newGame
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /games/:id - Récupère un jeu par son ID
   */
  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const game = await this.gameService.findById(id);

      if (!game) {
        res.status(404).json({
          success: false,
          message: 'Jeu non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: game
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /games - Liste tous les jeux avec pagination
   */
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options: IPaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await this.gameService.list(options);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /games/search - Recherche de jeux avec filtres multiples
   * Query params possibles:
   * - keyword: recherche dans title et description
   * - genre: filtre par genre
   * - platform: filtre par plateforme
   * - minRating: note minimale
   * - maxPrice: prix maximum
   * - inStock: disponibilité (true/false)
   * - minYear: année minimale
   * - maxYear: année maximale
   * - page, limit, sortBy, sortOrder: pagination
   */
  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: IGameSearchFilters = {
        keyword: req.query.keyword as string,
        genre: req.query.genre as string,
        platform: req.query.platform as string,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        inStock: req.query.inStock ? req.query.inStock === 'true' : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined
      };

      const options: IPaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: (req.query.sortBy as string) || 'rating',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await this.gameService.search(filters, options);

      res.status(200).json({
        success: true,
        message: `${result.pagination.totalItems} jeu(x) trouvé(s)`,
        data: result.data,
        pagination: result.pagination,
        filters: filters
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /games/:id - Met à jour un jeu
   */
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const gameData: Partial<IGame> = req.body;
      
      const updatedGame = await this.gameService.update(id, gameData);

      if (!updatedGame) {
        res.status(404).json({
          success: false,
          message: 'Jeu non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Jeu mis à jour avec succès',
        data: updatedGame
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /games/:id - Supprime un jeu
   */
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedGame = await this.gameService.delete(id);

      if (!deletedGame) {
        res.status(404).json({
          success: false,
          message: 'Jeu non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Jeu supprimé avec succès',
        data: deletedGame
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /games/stats/count - Compte le nombre total de jeux
   */
  public count = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const total = await this.gameService.count();

      res.status(200).json({
        success: true,
        data: {
          totalGames: total
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /games/stats/genres - Récupère les genres disponibles
   */
  public getGenres = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const genres = await this.gameService.getAvailableGenres();

      res.status(200).json({
        success: true,
        data: {
          genres: genres
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /games/stats/platforms - Récupère les plateformes disponibles
   */
  public getPlatforms = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const platforms = await this.gameService.getAvailablePlatforms();

      res.status(200).json({
        success: true,
        data: {
          platforms: platforms
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

