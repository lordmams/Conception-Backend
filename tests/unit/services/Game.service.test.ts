import { GameService } from '../../../src/services/Game.service';
import { mockGames, mockGame } from '../../fixtures/games';
import { IGameSearchFilters } from '../../../src/types/game.types';

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService();
  });

  describe('create', () => {
    it('devrait créer un nouveau jeu', async () => {
      const game = await gameService.create(mockGame);

      expect(game).toBeDefined();
      expect(game.title).toBe(mockGame.title);
      expect(game.description).toBe(mockGame.description);
      expect(game.genre).toBe(mockGame.genre);
      expect(game.rating).toBe(mockGame.rating);
    });

    it('devrait échouer avec des données invalides', async () => {
      const invalidData = {
        ...mockGame,
        rating: 15 // Note invalide
      };

      await expect(gameService.create(invalidData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('devrait trouver un jeu par son ID', async () => {
      const createdGame = await gameService.create(mockGame);
      const foundGame = await gameService.findById(createdGame._id.toString());

      expect(foundGame).toBeDefined();
      expect(foundGame?.title).toBe(mockGame.title);
    });

    it('devrait retourner null si le jeu n\'existe pas', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const game = await gameService.findById(fakeId);

      expect(game).toBeNull();
    });
  });

  describe('list', () => {
    beforeEach(async () => {
      // Créer plusieurs jeux de test
      for (const game of mockGames) {
        await gameService.create(game);
      }
    });

    it('devrait lister tous les jeux avec pagination', async () => {
      const result = await gameService.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(mockGames.length);
      expect(result.pagination.totalItems).toBe(mockGames.length);
      expect(result.pagination.currentPage).toBe(1);
    });

    it('devrait respecter la limite de pagination', async () => {
      const result = await gameService.list({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.itemsPerPage).toBe(2);
      expect(result.pagination.hasNextPage).toBe(true);
    });

    it('devrait trier par note décroissante', async () => {
      const result = await gameService.list({
        sortBy: 'rating',
        sortOrder: 'desc'
      });

      const ratings = result.data.map(g => g.rating);
      expect(ratings[0]).toBeGreaterThanOrEqual(ratings[1]);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      for (const game of mockGames) {
        await gameService.create(game);
      }
    });

    it('devrait rechercher par mot-clé dans le titre', async () => {
      const filters: IGameSearchFilters = {
        keyword: 'zelda'
      };

      const result = await gameService.search(filters);

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].title.toLowerCase()).toContain('zelda');
    });

    it('devrait rechercher par mot-clé dans la description', async () => {
      const filters: IGameSearchFilters = {
        keyword: 'monde ouvert'
      };

      const result = await gameService.search(filters);

      expect(result.data.length).toBeGreaterThan(0);
    });

    it('devrait filtrer par genre', async () => {
      const filters: IGameSearchFilters = {
        genre: 'RPG'
      };

      const result = await gameService.search(filters);

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(game => {
        expect(game.genre).toBe('RPG');
      });
    });

    it('devrait filtrer par plateforme', async () => {
      const filters: IGameSearchFilters = {
        platform: 'PS5'
      };

      const result = await gameService.search(filters);

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(game => {
        expect(game.platform).toContain('PS5');
      });
    });

    it('devrait filtrer par note minimale', async () => {
      const filters: IGameSearchFilters = {
        minRating: 9.0
      };

      const result = await gameService.search(filters);

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(game => {
        expect(game.rating).toBeGreaterThanOrEqual(9.0);
      });
    });

    it('devrait filtrer par prix maximum', async () => {
      const filters: IGameSearchFilters = {
        maxPrice: 60
      };

      const result = await gameService.search(filters);

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(game => {
        expect(game.price).toBeLessThanOrEqual(60);
      });
    });

    it('devrait filtrer par disponibilité', async () => {
      const filters: IGameSearchFilters = {
        inStock: true
      };

      const result = await gameService.search(filters);

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(game => {
        expect(game.inStock).toBe(true);
      });
    });

    it('devrait combiner plusieurs filtres', async () => {
      const filters: IGameSearchFilters = {
        keyword: 'remake',
        genre: 'Horror',
        minRating: 9.0
      };

      const result = await gameService.search(filters);

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(game => {
        expect(game.genre).toBe('Horror');
        expect(game.rating).toBeGreaterThanOrEqual(9.0);
      });
    });

    it('devrait retourner un résultat vide si aucun jeu ne correspond', async () => {
      const filters: IGameSearchFilters = {
        keyword: 'jeuinexistant12345'
      };

      const result = await gameService.search(filters);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un jeu', async () => {
      const game = await gameService.create(mockGame);
      const updatedData = { price: 49.99, rating: 9.9 };

      const updatedGame = await gameService.update(game._id.toString(), updatedData);

      expect(updatedGame).toBeDefined();
      expect(updatedGame?.price).toBe(49.99);
      expect(updatedGame?.rating).toBe(9.9);
    });

    it('devrait retourner null si le jeu n\'existe pas', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await gameService.update(fakeId, { price: 50 });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('devrait supprimer un jeu', async () => {
      const game = await gameService.create(mockGame);
      const deletedGame = await gameService.delete(game._id.toString());

      expect(deletedGame).toBeDefined();
      expect(deletedGame?.title).toBe(mockGame.title);

      // Vérifier que le jeu n'existe plus
      const foundGame = await gameService.findById(game._id.toString());
      expect(foundGame).toBeNull();
    });

    it('devrait retourner null si le jeu n\'existe pas', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await gameService.delete(fakeId);

      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('devrait compter le nombre de jeux', async () => {
      for (const game of mockGames) {
        await gameService.create(game);
      }

      const count = await gameService.count();

      expect(count).toBe(mockGames.length);
    });

    it('devrait retourner 0 s\'il n\'y a pas de jeux', async () => {
      const count = await gameService.count();

      expect(count).toBe(0);
    });
  });

  describe('getAvailableGenres', () => {
    it('devrait retourner tous les genres disponibles', async () => {
      for (const game of mockGames) {
        await gameService.create(game);
      }

      const genres = await gameService.getAvailableGenres();

      expect(genres.length).toBeGreaterThan(0);
      expect(genres).toContain('Adventure');
      expect(genres).toContain('RPG');
    });
  });

  describe('getAvailablePlatforms', () => {
    it('devrait retourner toutes les plateformes disponibles', async () => {
      for (const game of mockGames) {
        await gameService.create(game);
      }

      const platforms = await gameService.getAvailablePlatforms();

      expect(platforms.length).toBeGreaterThan(0);
      expect(platforms).toContain('PS5');
      expect(platforms).toContain('Nintendo Switch');
    });
  });
});

