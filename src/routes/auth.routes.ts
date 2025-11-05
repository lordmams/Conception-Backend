import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate, authValidation } from '../middlewares/validation.middleware';
import { UserRole } from '../types/auth.types';

/**
 * Configuration des routes pour l'authentification
 */
export class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  /**
   * Initialise toutes les routes
   */
  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Inscription d'un nouvel utilisateur
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - email
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *                 minLength: 3
     *                 maxLength: 50
     *                 example: johndoe
     *               email:
     *                 type: string
     *                 format: email
     *                 example: john@example.com
     *               password:
     *                 type: string
     *                 minLength: 6
     *                 example: motdepasse123
     *     responses:
     *       201:
     *         description: Inscription réussie
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 token:
     *                   type: string
     *                 user:
     *                   type: object
     *       400:
     *         description: Données invalides ou email déjà utilisé
     */
    this.router.post(
      '/register',
      validate(authValidation.register),
      this.authController.register
    );

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Connexion d'un utilisateur
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: john@example.com
     *               password:
     *                 type: string
     *                 example: motdepasse123
     *     responses:
     *       200:
     *         description: Connexion réussie
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 token:
     *                   type: string
     *                 user:
     *                   type: object
     *       401:
     *         description: Email ou mot de passe incorrect
     */
    this.router.post(
      '/login',
      validate(authValidation.login),
      this.authController.login
    );

    /**
     * @swagger
     * /api/auth/profile:
     *   get:
     *     summary: Récupérer le profil de l'utilisateur connecté
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Profil récupéré
     *       401:
     *         description: Non authentifié
     */
    this.router.get(
      '/profile',
      authenticate,
      this.authController.getProfile
    );

    /**
     * @swagger
     * /api/auth/users:
     *   get:
     *     summary: Lister tous les utilisateurs (admin seulement)
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Liste des utilisateurs
     *       403:
     *         description: Permissions insuffisantes
     */
    this.router.get(
      '/users',
      authenticate,
      authorize([UserRole.ADMIN]),
      this.authController.listUsers
    );

    /**
     * @swagger
     * /api/auth/users/{id}/role:
     *   patch:
     *     summary: Changer le rôle d'un utilisateur (admin seulement)
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               role:
     *                 type: string
     *                 enum: [user, admin, moderator]
     *     responses:
     *       200:
     *         description: Rôle modifié
     *       403:
     *         description: Permissions insuffisantes
     */
    this.router.patch(
      '/users/:id/role',
      authenticate,
      authorize([UserRole.ADMIN]),
      this.authController.changeUserRole
    );
  }

  /**
   * Retourne le router configuré
   */
  public getRouter(): Router {
    return this.router;
  }
}

