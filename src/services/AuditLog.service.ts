import { MySQLConfig } from '../config/mysql';

/**
 * Interface pour un log d'audit
 */
export interface IAuditLog {
  id?: number;
  user_id?: number | string; // Accepte string pour conversion depuis controller
  action: string;
  resource: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  created_at?: Date;
}

/**
 * Service pour gérer les logs d'audit dans MySQL
 * Exemple d'utilisation de MySQL dans l'application
 */
export class AuditLogService {
  private mysql: MySQLConfig;

  constructor() {
    this.mysql = MySQLConfig.getInstance();
  }

  /**
   * Initialise la table audit_logs si elle n'existe pas
   * Avec relation vers la table users (clé étrangère)
   */
  public async initTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(50) NOT NULL,
        resource VARCHAR(50) NOT NULL,
        resource_id VARCHAR(100),
        details JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_action (action),
        INDEX idx_resource (resource),
        INDEX idx_created (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    try {
      await this.mysql.query(createTableSQL);
      console.log('✅ Table audit_logs initialisée avec relation vers users');
    } catch (error) {
      console.error('❌ Erreur lors de la création de la table audit_logs:', error);
    }
  }

  /**
   * Enregistre un log d'audit
   */
  public async log(data: IAuditLog): Promise<void> {
    try {
      const sql = `
        INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      // Convertir user_id en number si c'est une string
      const userId = data.user_id 
        ? (typeof data.user_id === 'string' ? parseInt(data.user_id) : data.user_id)
        : null;

      await this.mysql.query(sql, [
        userId,
        data.action,
        data.resource,
        data.resource_id || null,
        data.details ? JSON.stringify(data.details) : null,
        data.ip_address || null
      ]);
    } catch (error) {
      // Ne pas faire échouer l'opération principale si le log échoue
      console.error('⚠️  Erreur lors de l\'enregistrement du log d\'audit:', error);
    }
  }

  /**
   * Récupère les logs d'audit avec pagination
   */
  public async getLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = [];
    let params: any[] = [];

    if (filters?.userId) {
      whereConditions.push('user_id = ?');
      params.push(filters.userId);
    }

    if (filters?.action) {
      whereConditions.push('action = ?');
      params.push(filters.action);
    }

    if (filters?.resource) {
      whereConditions.push('resource = ?');
      params.push(filters.resource);
    }

    if (filters?.startDate) {
      whereConditions.push('created_at >= ?');
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      whereConditions.push('created_at <= ?');
      params.push(filters.endDate);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Récupérer les logs
    const logsSQL = `
      SELECT * FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const logs = await this.mysql.query<IAuditLog[]>(logsSQL, [...params, limit, offset]);

    // Compter le total
    const countSQL = `
      SELECT COUNT(*) as total FROM audit_logs
      ${whereClause}
    `;

    const countResult = await this.mysql.query<any[]>(countSQL, params);
    const total = countResult[0]?.total || 0;

    return { logs, total };
  }

  /**
   * Récupère les logs d'un utilisateur spécifique
   */
  public async getUserLogs(userId: string | number, limit: number = 50): Promise<IAuditLog[]> {
    const sql = `
      SELECT * FROM audit_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    return await this.mysql.query<IAuditLog[]>(sql, [userIdNum, limit]);
  }

  /**
   * Récupère les statistiques des actions
   */
  public async getActionStats(days: number = 7): Promise<any[]> {
    const sql = `
      SELECT 
        action,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY action, DATE(created_at)
      ORDER BY date DESC, count DESC
    `;

    return await this.mysql.query(sql, [days]);
  }

  /**
   * Supprime les logs anciens
   */
  public async cleanOldLogs(days: number = 90): Promise<number> {
    const sql = `
      DELETE FROM audit_logs
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    const result: any = await this.mysql.query(sql, [days]);
    return result.affectedRows || 0;
  }
}

