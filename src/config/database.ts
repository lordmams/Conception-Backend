import mongoose from 'mongoose';

/**
 * Classe de gestion de la connexion à MongoDB
 */
export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private isConnected: boolean = false;

  private constructor() {}

  /**
   * Récupère l'instance unique de DatabaseConfig (Singleton)
   */
  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  /**
   * Établit la connexion à MongoDB
   */
  public async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      console.log('📦 Déjà connecté à MongoDB');
      return;
    }

    try {
      await mongoose.connect(uri);
      this.isConnected = true;
      console.log('✅ Connexion à MongoDB établie avec succès');

      // Gestion des événements de connexion
      mongoose.connection.on('error', (error) => {
        console.error('❌ Erreur de connexion MongoDB:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  Déconnecté de MongoDB');
        this.isConnected = false;
      });

      // Gestion de l'arrêt gracieux
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Erreur lors de la connexion à MongoDB:', error);
      throw error;
    }
  }

  /**
   * Ferme la connexion à MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('👋 Déconnexion de MongoDB réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  /**
   * Vérifie l'état de la connexion
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

