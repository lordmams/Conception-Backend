import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { DatabaseConfig } from './config/database';
import { GameRoutes } from './routes/game.routes';
import { AuthRoutes } from './routes/auth.routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { generalLimiter } from './middlewares/rateLimit.middleware';
import { swaggerSpec } from './config/swagger';

// Chargement des variables d'environnement
dotenv.config();

/**
 * Classe principale de l'application Express
 */
class Server {
  private app: Application;
  private port: number;
  private databaseConfig: DatabaseConfig;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.databaseConfig = DatabaseConfig.getInstance();
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Configure les middlewares de base
   */
  private initializeMiddlewares(): void {
    // Sécurité HTTP avec Helmet
    this.app.use(helmet());

    // CORS configuré
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }));

    // Rate limiting global
    this.app.use(generalLimiter);

    // Parser JSON
    this.app.use(express.json());

    // Parser URL-encoded
    this.app.use(express.urlencoded({ extended: true }));

    // Logger simple
    this.app.use((req, _res, next) => {
      console.log(`📨 ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Configure les routes de l'application
   */
  private initializeRoutes(): void {
    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Vérifier l'état de l'API
     *     tags: [Health]
     *     responses:
     *       200:
     *         description: API opérationnelle
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 timestamp:
     *                   type: string
     *                 database:
     *                   type: string
     */
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        database: this.databaseConfig.getConnectionStatus() ? 'connected' : 'disconnected'
      });
    });

    // Routes principales
    const gameRoutes = new GameRoutes();
    const authRoutes = new AuthRoutes();
    
    this.app.use('/api/games', gameRoutes.getRouter());
    this.app.use('/api/auth', authRoutes.getRouter());

    // Documentation Swagger sur la page d'accueil
    this.app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Game API Documentation',
    }));
  }

  /**
   * Configure la gestion des erreurs
   */
  private initializeErrorHandling(): void {
    // Route non trouvée
    this.app.use(notFoundHandler);

    // Gestionnaire d'erreurs global
    this.app.use(errorHandler);
  }

  /**
   * Démarre le serveur
   */
  public async start(): Promise<void> {
    try {
      // Connexion à MongoDB
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamedb';
      await this.databaseConfig.connect(mongoUri);

      // Démarrage du serveur
      this.app.listen(this.port, () => {
        console.log('=================================');
        console.log(`🚀 Serveur démarré sur le port ${this.port}`);
        console.log(`📚 Documentation: http://localhost:${this.port}`);
        console.log(`🏥 Health: http://localhost:${this.port}/health`);
        console.log(`🎮 API: http://localhost:${this.port}/api/games`);
        console.log('=================================');
      });
    } catch (error) {
      console.error('❌ Impossible de démarrer le serveur:', error);
      process.exit(1);
    }
  }
}

// Lancement du serveur
const server = new Server();
server.start();

