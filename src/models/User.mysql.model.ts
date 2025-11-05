import { MySQLConfig } from '../config/mysql';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/auth.types';

/**
 * Interface pour un utilisateur dans MySQL
 */
export interface IUserMySQL {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Modèle User pour MySQL
 * Remplace le modèle Mongoose pour démontrer l'utilisation de SQL
 */
export class UserMySQLModel {
  private mysql: MySQLConfig;

  constructor() {
    this.mysql = MySQLConfig.getInstance();
  }

  /**
   * Initialise la table users
   */
  public async initTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'moderator', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    try {
      await this.mysql.query(createTableSQL);
      console.log('✅ Table users initialisée');
    } catch (error) {
      console.error('❌ Erreur lors de la création de la table users:', error);
      throw error;
    }
  }

  /**
   * Hache un mot de passe
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compare un mot de passe avec son hash
   */
  public async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Crée un nouvel utilisateur
   */
  public async create(userData: IUserMySQL): Promise<IUserMySQL> {
    const hashedPassword = await this.hashPassword(userData.password!);

    const sql = `
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    try {
      const result: any = await this.mysql.query(sql, [
        userData.username,
        userData.email,
        hashedPassword,
        userData.role || UserRole.USER
      ]);

      // Récupérer l'utilisateur créé
      return await this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Un utilisateur avec cet email ou nom d\'utilisateur existe déjà');
      }
      throw error;
    }
  }

  /**
   * Trouve un utilisateur par ID
   */
  public async findById(id: number): Promise<IUserMySQL> {
    const sql = `
      SELECT id, username, email, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `;

    const users = await this.mysql.query<IUserMySQL[]>(sql, [id]);
    
    if (!users || users.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }

    return users[0];
  }

  /**
   * Trouve un utilisateur par email
   */
  public async findByEmail(email: string): Promise<IUserMySQL | null> {
    const sql = `
      SELECT id, username, email, role, created_at, updated_at
      FROM users
      WHERE email = ?
    `;

    const users = await this.mysql.query<IUserMySQL[]>(sql, [email]);
    return users && users.length > 0 ? users[0] : null;
  }

  /**
   * Trouve un utilisateur par email avec son mot de passe
   */
  public async findByEmailWithPassword(email: string): Promise<IUserMySQL | null> {
    const sql = `
      SELECT id, username, email, password, role, created_at, updated_at
      FROM users
      WHERE email = ?
    `;

    const users = await this.mysql.query<IUserMySQL[]>(sql, [email]);
    return users && users.length > 0 ? users[0] : null;
  }

  /**
   * Trouve un utilisateur par nom d'utilisateur
   */
  public async findByUsername(username: string): Promise<IUserMySQL | null> {
    const sql = `
      SELECT id, username, email, role, created_at, updated_at
      FROM users
      WHERE username = ?
    `;

    const users = await this.mysql.query<IUserMySQL[]>(sql, [username]);
    return users && users.length > 0 ? users[0] : null;
  }

  /**
   * Liste tous les utilisateurs
   */
  public async findAll(): Promise<IUserMySQL[]> {
    const sql = `
      SELECT id, username, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;

    return await this.mysql.query<IUserMySQL[]>(sql);
  }

  /**
   * Met à jour le rôle d'un utilisateur
   */
  public async updateRole(id: number, role: UserRole): Promise<IUserMySQL> {
    const sql = `
      UPDATE users
      SET role = ?
      WHERE id = ?
    `;

    await this.mysql.query(sql, [role, id]);
    return await this.findById(id);
  }

  /**
   * Supprime un utilisateur
   */
  public async delete(id: number): Promise<boolean> {
    const sql = `
      DELETE FROM users
      WHERE id = ?
    `;

    const result: any = await this.mysql.query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Compte le nombre d'utilisateurs
   */
  public async count(): Promise<number> {
    const sql = `
      SELECT COUNT(*) as total
      FROM users
    `;

    const result = await this.mysql.query<any[]>(sql);
    return result[0]?.total || 0;
  }

  /**
   * Compte le nombre d'utilisateurs par rôle
   */
  public async countByRole(): Promise<{ role: string; count: number }[]> {
    const sql = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `;

    return await this.mysql.query(sql);
  }
}

