import mysql from 'mysql2/promise';

/**
 * Classe de gestion de la connexion à MySQL
 * Singleton pour gérer un pool de connexions
 */
export class MySQLConfig {
  private static instance: MySQLConfig;
  private pool: mysql.Pool | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  /**
   * Récupère l'instance unique de MySQLConfig (Singleton)
   */
  public static getInstance(): MySQLConfig {
    if (!MySQLConfig.instance) {
      MySQLConfig.instance = new MySQLConfig();
    }
    return MySQLConfig.instance;
  }

  /**
   * Établit la connexion à MySQL avec un pool de connexions
   */
  public async connect(): Promise<void> {
    if (this.isConnected && this.pool) {
      console.log('🐬 Déjà connecté à MySQL');
      return;
    }

    try {
      const config = {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'gameapi',
        password: process.env.MYSQL_PASSWORD || 'gameapi123',
        database: process.env.MYSQL_DATABASE || 'gamedb_sql',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      };

      this.pool = mysql.createPool(config);

      // Tester la connexion
      const connection = await this.pool.getConnection();
      console.log('✅ Connexion à MySQL établie avec succès');
      connection.release();

      this.isConnected = true;

      // Gestion de l'arrêt gracieux
      process.on('SIGINT', async () => {
        await this.disconnect();
      });

    } catch (error) {
      console.error('❌ Erreur lors de la connexion à MySQL:', error);
      throw error;
    }
  }

  /**
   * Ferme la connexion au pool MySQL
   */
  public async disconnect(): Promise<void> {
    if (!this.pool || !this.isConnected) {
      return;
    }

    try {
      await this.pool.end();
      this.isConnected = false;
      this.pool = null;
      console.log('👋 Déconnexion de MySQL réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion de MySQL:', error);
      throw error;
    }
  }

  /**
   * Récupère le pool de connexions
   */
  public getPool(): mysql.Pool {
    if (!this.pool) {
      throw new Error('MySQL pool not initialized. Call connect() first.');
    }
    return this.pool;
  }

  /**
   * Exécute une requête SQL
   * @param sql - Requête SQL
   * @param params - Paramètres de la requête
   * @returns Résultat de la requête
   */
  public async query<T = any>(sql: string, params?: any[]): Promise<T> {
    if (!this.pool) {
      throw new Error('MySQL pool not initialized. Call connect() first.');
    }

    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows as T;
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la requête MySQL:', error);
      throw error;
    }
  }

  /**
   * Vérifie l'état de la connexion
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Exécute une transaction
   * @param callback - Fonction contenant les requêtes de la transaction
   */
  public async transaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
  ): Promise<T> {
    if (!this.pool) {
      throw new Error('MySQL pool not initialized. Call connect() first.');
    }

    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

