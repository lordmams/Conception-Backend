import { IGame } from '../../src/types/game.types';

/**
 * Données de test pour les jeux
 */
export const mockGames: IGame[] = [
  {
    title: 'The Legend of Zelda: Breath of the Wild',
    description: 'Un jeu d\'action-aventure en monde ouvert où Link doit sauver Hyrule',
    genre: 'Adventure',
    platform: ['Nintendo Switch', 'Wii U'],
    releaseYear: 2017,
    publisher: 'Nintendo',
    rating: 9.8,
    price: 59.99,
    inStock: true
  },
  {
    title: 'Elden Ring',
    description: 'Un action-RPG épique en monde ouvert signé FromSoftware',
    genre: 'RPG',
    platform: ['PS5', 'Xbox Series X', 'PC'],
    releaseYear: 2022,
    publisher: 'Bandai Namco',
    rating: 9.5,
    price: 59.99,
    inStock: true
  },
  {
    title: 'FIFA 24',
    description: 'Le jeu de football le plus populaire avec des graphismes améliorés',
    genre: 'Sports',
    platform: ['PS5', 'Xbox Series X', 'PC'],
    releaseYear: 2023,
    publisher: 'EA Sports',
    rating: 7.5,
    price: 69.99,
    inStock: false
  },
  {
    title: 'Resident Evil 4 Remake',
    description: 'Le remake du classique survival horror avec des graphismes modernes',
    genre: 'Horror',
    platform: ['PS5', 'Xbox Series X', 'PC'],
    releaseYear: 2023,
    publisher: 'Capcom',
    rating: 9.2,
    price: 59.99,
    inStock: true
  }
];

export const mockGame: IGame = mockGames[0];

export const invalidGame = {
  title: 'A', // Trop court
  description: 'Short', // Trop court
  genre: 'InvalidGenre', // Genre invalide
  platform: [], // Vide
  releaseYear: 1950, // Trop ancien
  publisher: 'Test',
  rating: 11, // Trop élevé
  price: -10, // Négatif
  inStock: true
};

