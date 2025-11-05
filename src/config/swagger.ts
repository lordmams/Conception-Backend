import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

/**
 * Configuration Swagger/OpenAPI
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Game Collection API',
      version: '1.0.0',
      description: 'API REST pour gérer une collection de jeux vidéo avec MongoDB, Express et TypeScript',
      contact: {
        name: 'API Support',
        email: 'support@gameapi.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
      {
        url: 'http://localhost:3000',
        description: 'Serveur de production',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Authentification et gestion des utilisateurs',
      },
      {
        name: 'Games',
        description: 'Gestion des jeux vidéo',
      },
      {
        name: 'Stats',
        description: 'Statistiques et données agrégées',
      },
      {
        name: 'Health',
        description: 'État de santé de l\'API',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre token JWT (sans le préfixe "Bearer")',
        },
      },
      schemas: {
        Game: {
          type: 'object',
          required: ['title', 'description', 'genre', 'platform', 'releaseYear', 'publisher'],
          properties: {
            id: {
              type: 'string',
              description: 'ID unique du jeu',
              example: '507f1f77bcf86cd799439011',
            },
            title: {
              type: 'string',
              minLength: 2,
              description: 'Titre du jeu',
              example: 'The Legend of Zelda: Breath of the Wild',
            },
            description: {
              type: 'string',
              minLength: 10,
              description: 'Description du jeu',
              example: 'Un jeu d\'aventure en monde ouvert époustouflant',
            },
            genre: {
              type: 'string',
              enum: ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Simulation', 'Puzzle', 'Horror', 'Fighting', 'Platform', 'Shooter'],
              description: 'Genre du jeu',
              example: 'Adventure',
            },
            platform: {
              type: 'array',
              items: {
                type: 'string',
              },
              minItems: 1,
              description: 'Plateformes disponibles',
              example: ['Nintendo Switch', 'Wii U'],
            },
            releaseYear: {
              type: 'number',
              minimum: 1970,
              description: 'Année de sortie',
              example: 2017,
            },
            publisher: {
              type: 'string',
              description: 'Éditeur du jeu',
              example: 'Nintendo',
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 10,
              default: 0,
              description: 'Note du jeu (0-10)',
              example: 9.8,
            },
            price: {
              type: 'number',
              minimum: 0,
              default: 0,
              description: 'Prix du jeu',
              example: 59.99,
            },
            inStock: {
              type: 'boolean',
              default: true,
              description: 'Disponibilité en stock',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour',
            },
          },
        },
        GameInput: {
          type: 'object',
          required: ['title', 'description', 'genre', 'platform', 'releaseYear', 'publisher'],
          properties: {
            title: {
              type: 'string',
              minLength: 2,
              example: 'The Legend of Zelda: Breath of the Wild',
            },
            description: {
              type: 'string',
              minLength: 10,
              example: 'Un jeu d\'aventure en monde ouvert',
            },
            genre: {
              type: 'string',
              enum: ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Simulation', 'Puzzle', 'Horror', 'Fighting', 'Platform', 'Shooter'],
              example: 'Adventure',
            },
            platform: {
              type: 'array',
              items: {
                type: 'string',
              },
              minItems: 1,
              example: ['Nintendo Switch'],
            },
            releaseYear: {
              type: 'number',
              minimum: 1970,
              example: 2017,
            },
            publisher: {
              type: 'string',
              example: 'Nintendo',
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 10,
              example: 9.8,
            },
            price: {
              type: 'number',
              minimum: 0,
              example: 59.99,
            },
            inStock: {
              type: 'boolean',
              example: true,
            },
          },
        },
        PaginatedGames: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Game',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: {
                  type: 'number',
                  example: 1,
                },
                totalPages: {
                  type: 'number',
                  example: 5,
                },
                totalItems: {
                  type: 'number',
                  example: 50,
                },
                itemsPerPage: {
                  type: 'number',
                  example: 10,
                },
                hasNextPage: {
                  type: 'boolean',
                  example: true,
                },
                hasPreviousPage: {
                  type: 'boolean',
                  example: false,
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Opération réussie',
            },
            data: {
              $ref: '#/components/schemas/Game',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Une erreur est survenue',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  // Chemins vers les fichiers contenant les annotations JSDoc
    apis: [
      path.join(__dirname, '../routes/game.routes.ts'),
      path.join(__dirname, '../routes/game.routes.js'),
      path.join(__dirname, '../routes/auth.routes.ts'),
      path.join(__dirname, '../routes/auth.routes.js'),
      path.join(__dirname, '../server.ts'),
      path.join(__dirname, '../server.js'),
    ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

