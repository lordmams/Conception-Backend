import { GameModel } from '../../../src/models/Game.model';
import { mockGame } from '../../fixtures/games';

describe('Game Model', () => {
  describe('Validation', () => {
    it('devrait créer un jeu valide', async () => {
      const game = new GameModel(mockGame);
      const savedGame = await game.save();

      expect(savedGame._id).toBeDefined();
      expect(savedGame.title).toBe(mockGame.title);
      expect(savedGame.createdAt).toBeDefined();
      expect(savedGame.updatedAt).toBeDefined();
    });

    it('devrait échouer si le titre est trop court', async () => {
      const game = new GameModel({
        ...mockGame,
        title: 'A' // Trop court
      });

      await expect(game.save()).rejects.toThrow();
    });

    it('devrait échouer si la description est trop courte', async () => {
      const game = new GameModel({
        ...mockGame,
        description: 'Short' // Trop court
      });

      await expect(game.save()).rejects.toThrow();
    });

    it('devrait échouer avec un genre invalide', async () => {
      const game = new GameModel({
        ...mockGame,
        genre: 'InvalidGenre'
      });

      await expect(game.save()).rejects.toThrow();
    });

    it('devrait échouer si platform est vide', async () => {
      const game = new GameModel({
        ...mockGame,
        platform: []
      });

      await expect(game.save()).rejects.toThrow();
    });

    it('devrait échouer avec une note > 10', async () => {
      const game = new GameModel({
        ...mockGame,
        rating: 15
      });

      await expect(game.save()).rejects.toThrow();
    });

    it('devrait échouer avec une note < 0', async () => {
      const game = new GameModel({
        ...mockGame,
        rating: -1
      });

      await expect(game.save()).rejects.toThrow();
    });

    it('devrait échouer avec un prix négatif', async () => {
      const game = new GameModel({
        ...mockGame,
        price: -10
      });

      await expect(game.save()).rejects.toThrow();
    });

    it('devrait échouer avec une année trop ancienne', async () => {
      const game = new GameModel({
        ...mockGame,
        releaseYear: 1950 // Avant 1970
      });

      await expect(game.save()).rejects.toThrow();
    });

    it('devrait accepter une année future (+2 ans max)', async () => {
      const futureYear = new Date().getFullYear() + 1;
      const game = new GameModel({
        ...mockGame,
        releaseYear: futureYear
      });

      const savedGame = await game.save();
      expect(savedGame.releaseYear).toBe(futureYear);
    });

    it('devrait échouer si des champs requis sont manquants', async () => {
      const game = new GameModel({
        title: 'Test Game'
        // Manque tous les autres champs requis
      });

      await expect(game.save()).rejects.toThrow();
    });
  });

  describe('Valeurs par défaut', () => {
    it('devrait définir inStock à true par défaut', async () => {
      const gameData = { ...mockGame };
      delete (gameData as any).inStock;

      const game = new GameModel(gameData);
      const savedGame = await game.save();

      expect(savedGame.inStock).toBe(true);
    });

    it('devrait définir rating à 0 par défaut', async () => {
      const gameData = { ...mockGame };
      delete (gameData as any).rating;

      const game = new GameModel(gameData);
      const savedGame = await game.save();

      expect(savedGame.rating).toBe(0);
    });

    it('devrait définir price à 0 par défaut', async () => {
      const gameData = { ...mockGame };
      delete (gameData as any).price;

      const game = new GameModel(gameData);
      const savedGame = await game.save();

      expect(savedGame.price).toBe(0);
    });
  });

  describe('Trimming', () => {
    it('devrait trim le titre', async () => {
      const game = new GameModel({
        ...mockGame,
        title: '  Test Game  '
      });

      const savedGame = await game.save();
      expect(savedGame.title).toBe('Test Game');
    });

    it('devrait trim la description', async () => {
      const game = new GameModel({
        ...mockGame,
        description: '  Test description with spaces  '
      });

      const savedGame = await game.save();
      expect(savedGame.description).toBe('Test description with spaces');
    });
  });

  describe('Timestamps', () => {
    it('devrait automatiquement créer createdAt et updatedAt', async () => {
      const game = new GameModel(mockGame);
      const savedGame = await game.save();

      expect(savedGame.createdAt).toBeDefined();
      expect(savedGame.updatedAt).toBeDefined();
      expect(savedGame.createdAt).toBeInstanceOf(Date);
      expect(savedGame.updatedAt).toBeInstanceOf(Date);
    });

    it('devrait mettre à jour updatedAt lors d\'une modification', async () => {
      const game = new GameModel(mockGame);
      const savedGame = await game.save();
      const originalUpdatedAt = savedGame.updatedAt;

      // Attendre un peu
      await new Promise(resolve => setTimeout(resolve, 100));

      savedGame.price = 49.99;
      await savedGame.save();

      expect(savedGame.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });
});

