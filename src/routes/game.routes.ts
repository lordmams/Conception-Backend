import { Router } from 'express';
import { GameController } from '../controllers/Game.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.middleware';
import { validate, gameValidation } from '../middlewares/validation.middleware';
import { createLimiter, searchLimiter } from '../middlewares/rateLimit.middleware';
import { UserRole } from '../types/auth.types';

/**
 * Configuration des routes pour les jeux vidéo
 */
export class GameRoutes {
  public router: Router;
  private gameController: GameController;

  constructor() {
    this.router = Router();
    this.gameController = new GameController();
    this.initializeRoutes();
  }

  /**
   * Initialise toutes les routes
   */
  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/games/search:
     *   get:
     *     summary: Rechercher des jeux avec filtres
     *     tags: [Games]
     *     parameters:
     *       - in: query
     *         name: keyword
     *         schema:
     *           type: string
     *         description: Mot-clé de recherche
     *       - in: query
     *         name: genre
     *         schema:
     *           type: string
     *         description: Genre du jeu
     *       - in: query
     *         name: platform
     *         schema:
     *           type: string
     *         description: Plateforme
     *       - in: query
     *         name: minRating
     *         schema:
     *           type: number
     *         description: Note minimale
     *       - in: query
     *         name: maxPrice
     *         schema:
     *           type: number
     *         description: Prix maximum
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *     responses:
     *       200:
     *         description: Liste des jeux filtrés
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PaginatedGames'
     */
    this.router.get(
      '/search',
      optionalAuthenticate,
      searchLimiter,
      this.gameController.search
    );

    /**
     * @swagger
     * /api/games:
     *   post:
     *     summary: Créer un nouveau jeu
     *     tags: [Games]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/GameInput'
     *     responses:
     *       201:
     *         description: Jeu créé avec succès
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       400:
     *         description: Données invalides
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Non authentifié
     *     security:
     *       - bearerAuth: []
     */
    this.router.post(
      '/',
      authenticate,
      authorize([UserRole.ADMIN, UserRole.MODERATOR]),
      createLimiter,
      validate(gameValidation.create),
      this.gameController.create
    );

    /**
     * @swagger
     * /api/games/{id}:
     *   get:
     *     summary: Récupérer un jeu par son ID
     *     tags: [Games]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du jeu
     *     responses:
     *       200:
     *         description: Jeu trouvé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       404:
     *         description: Jeu non trouvé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get('/:id', this.gameController.getById);

    /**
     * @swagger
     * /api/games:
     *   get:
     *     summary: Lister tous les jeux avec pagination
     *     tags: [Games]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Numéro de page
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Nombre d'éléments par page
     *       - in: query
     *         name: sortBy
     *         schema:
     *           type: string
     *           default: createdAt
     *         description: Champ de tri
     *       - in: query
     *         name: sortOrder
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *           default: desc
     *         description: Ordre de tri
     *     responses:
     *       200:
     *         description: Liste des jeux
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PaginatedGames'
     */
    this.router.get('/', this.gameController.list);

    /**
     * @swagger
     * /api/games/{id}:
     *   put:
     *     summary: Mettre à jour un jeu
     *     tags: [Games]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du jeu
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/GameInput'
     *     responses:
     *       200:
     *         description: Jeu mis à jour
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       404:
     *         description: Jeu non trouvé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Non authentifié
     *     security:
     *       - bearerAuth: []
     */
    this.router.put(
      '/:id',
      authenticate,
      authorize([UserRole.ADMIN, UserRole.MODERATOR]),
      validate(gameValidation.update),
      this.gameController.update
    );

    /**
     * @swagger
     * /api/games/{id}:
     *   delete:
     *     summary: Supprimer un jeu
     *     tags: [Games]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du jeu
     *     responses:
     *       200:
     *         description: Jeu supprimé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       404:
     *         description: Jeu non trouvé
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Non authentifié
     *       403:
     *         description: Permissions insuffisantes (admin seulement)
     *     security:
     *       - bearerAuth: []
     */
    this.router.delete(
      '/:id',
      authenticate,
      authorize([UserRole.ADMIN]),
      this.gameController.delete
    );

    /**
     * @swagger
     * /api/games/stats/count:
     *   get:
     *     summary: Compter le nombre total de jeux
     *     tags: [Stats]
     *     responses:
     *       200:
     *         description: Nombre de jeux
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 count:
     *                   type: number
     */
    this.router.get('/stats/count', this.gameController.count);

    /**
     * @swagger
     * /api/games/stats/genres:
     *   get:
     *     summary: Récupérer tous les genres disponibles
     *     tags: [Stats]
     *     responses:
     *       200:
     *         description: Liste des genres
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 genres:
     *                   type: array
     *                   items:
     *                     type: string
     */
    this.router.get('/stats/genres', this.gameController.getGenres);

    /**
     * @swagger
     * /api/games/stats/platforms:
     *   get:
     *     summary: Récupérer toutes les plateformes disponibles
     *     tags: [Stats]
     *     responses:
     *       200:
     *         description: Liste des plateformes
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 platforms:
     *                   type: array
     *                   items:
     *                     type: string
     */
    this.router.get('/stats/platforms', this.gameController.getPlatforms);
  }

  /**
   * Retourne le router configuré
   */
  public getRouter(): Router {
    return this.router;
  }
}

