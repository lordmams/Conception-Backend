import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

// Configuration globale Jest
beforeAll(async () => {
  // Créer un serveur MongoDB en mémoire pour les tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Se connecter à MongoDB en mémoire
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Déconnecter et arrêter le serveur
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Nettoyer toutes les collections après chaque test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Augmenter le timeout pour les tests
jest.setTimeout(30000);

