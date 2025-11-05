import request from 'supertest';
import express, { Application } from 'express';
import { GameRoutes } from '../../src/routes/game.routes';
import { mockGames, mockGame } from '../fixtures/games';
import { errorHandler, notFoundHandler } from '../../src/middlewares/errorHandler';

describe('Game Routes Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    // Créer une application Express pour les tests
    app = express();
    app.use(express.json());
    
    const gameRoutes = new GameRoutes();
    app.use('/api/games', gameRoutes.getRouter());
    
    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  describe('POST /api/games', () => {
    it('devrait créer un nouveau jeu avec succès', async () => {
      const response = await request(app)
        .post('/api/games')
        .send(mockGame)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Jeu créé avec succès');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(mockGame.title);
      expect(response.body.data._id).toBeDefined();
    });

    it('devrait échouer avec des données invalides', async () => {
      const invalidData = {
        title: 'A', // Trop court
        description: 'Short',
        genre: 'InvalidGenre',
        platform: [],
        releaseYear: 2023,
        publisher: 'Test',
        rating: 15, // Trop élevé
        price: 50,
        inStock: true
      };

      const response = await request(app)
        .post('/api/games')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait échouer si des champs requis sont manquants', async () => {
      const incompleteData = {
        title: 'Test Game'
        // Manque tous les autres champs
      };

      const response = await request(app)
        .post('/api/games')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/games/:id', () => {
    it('devrait récupérer un jeu par son ID', async () => {
      // Créer d'abord un jeu
      const createResponse = await request(app)
        .post('/api/games')
        .send(mockGame);

      const gameId = createResponse.body.data._id;

      // Récupérer le jeu
      const response = await request(app)
        .get(`/api/games/${gameId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(mockGame.title);
    });

    it('devrait retourner 404 si le jeu n\'existe pas', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/games/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 400 avec un ID invalide', async () => {
      const response = await request(app)
        .get('/api/games/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/games', () => {
    beforeEach(async () => {
      // Créer plusieurs jeux
      for (const game of mockGames.slice(0, 3)) {
        await request(app).post('/api/games').send(game);
      }
    });

    it('devrait lister tous les jeux', async () => {
      const response = await request(app)
        .get('/api/games')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('devrait respecter la pagination', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.itemsPerPage).toBe(2);
      expect(response.body.pagination.currentPage).toBe(1);
    });

    it('devrait trier les résultats', async () => {
      const response = await request(app)
        .get('/api/games?sortBy=rating&sortOrder=desc')
        .expect(200);

      const ratings = response.body.data.map((g: any) => g.rating);
      expect(ratings[0]).toBeGreaterThanOrEqual(ratings[1] || 0);
    });
  });

  describe('GET /api/games/search', () => {
    beforeEach(async () => {
      for (const game of mockGames) {
        await request(app).post('/api/games').send(game);
      }
    });

    it('devrait rechercher par mot-clé', async () => {
      const response = await request(app)
        .get('/api/games/search?keyword=zelda')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.message).toContain('trouvé');
    });

    it('devrait filtrer par genre', async () => {
      const response = await request(app)
        .get('/api/games/search?genre=RPG')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((game: any) => {
        expect(game.genre).toBe('RPG');
      });
    });

    it('devrait filtrer par note minimale', async () => {
      const response = await request(app)
        .get('/api/games/search?minRating=9.0')
        .expect(200);

      response.body.data.forEach((game: any) => {
        expect(game.rating).toBeGreaterThanOrEqual(9.0);
      });
    });

    it('devrait filtrer par prix maximum', async () => {
      const response = await request(app)
        .get('/api/games/search?maxPrice=60')
        .expect(200);

      response.body.data.forEach((game: any) => {
        expect(game.price).toBeLessThanOrEqual(60);
      });
    });

    it('devrait combiner plusieurs filtres', async () => {
      const response = await request(app)
        .get('/api/games/search?genre=Horror&minRating=9&platform=PS5')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        response.body.data.forEach((game: any) => {
          expect(game.genre).toBe('Horror');
          expect(game.rating).toBeGreaterThanOrEqual(9);
        });
      }
    });

    it('devrait retourner un tableau vide si aucun résultat', async () => {
      const response = await request(app)
        .get('/api/games/search?keyword=inexistant12345')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.totalItems).toBe(0);
    });
  });

  describe('PUT /api/games/:id', () => {
    it('devrait mettre à jour un jeu', async () => {
      // Créer un jeu
      const createResponse = await request(app)
        .post('/api/games')
        .send(mockGame);

      const gameId = createResponse.body.data._id;

      // Mettre à jour
      const updateData = { price: 49.99, rating: 9.9 };
      const response = await request(app)
        .put(`/api/games/${gameId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(49.99);
      expect(response.body.data.rating).toBe(9.9);
    });

    it('devrait retourner 404 si le jeu n\'existe pas', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/games/${fakeId}`)
        .send({ price: 50 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/games/:id', () => {
    it('devrait supprimer un jeu', async () => {
      // Créer un jeu
      const createResponse = await request(app)
        .post('/api/games')
        .send(mockGame);

      const gameId = createResponse.body.data._id;

      // Supprimer
      const response = await request(app)
        .delete(`/api/games/${gameId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Jeu supprimé avec succès');

      // Vérifier qu'il n'existe plus
      await request(app)
        .get(`/api/games/${gameId}`)
        .expect(404);
    });

    it('devrait retourner 404 si le jeu n\'existe pas', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/games/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/games/stats/*', () => {
    beforeEach(async () => {
      for (const game of mockGames) {
        await request(app).post('/api/games').send(game);
      }
    });

    it('GET /api/games/stats/count - devrait compter les jeux', async () => {
      const response = await request(app)
        .get('/api/games/stats/count')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalGames).toBe(mockGames.length);
    });

    it('GET /api/games/stats/genres - devrait retourner les genres', async () => {
      const response = await request(app)
        .get('/api/games/stats/genres')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.genres).toBeInstanceOf(Array);
      expect(response.body.data.genres.length).toBeGreaterThan(0);
    });

    it('GET /api/games/stats/platforms - devrait retourner les plateformes', async () => {
      const response = await request(app)
        .get('/api/games/stats/platforms')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.platforms).toBeInstanceOf(Array);
      expect(response.body.data.platforms.length).toBeGreaterThan(0);
    });
  });
});

