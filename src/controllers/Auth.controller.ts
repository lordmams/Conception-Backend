import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/Auth.service';
import { AuditLogService } from '../services/AuditLog.service';
import { IRegisterData, ILoginData, UserRole } from '../types/auth.types';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Controller pour gérer les requêtes HTTP liées à l'authentification
 */
export class AuthController {
  private authService: AuthService;
  private auditLogService: AuditLogService;

  constructor() {
    this.authService = new AuthService();
    this.auditLogService = new AuditLogService();
  }

  /**
   * POST /auth/register - Inscription d'un nouvel utilisateur
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: IRegisterData = req.body;
      const result = await this.authService.register(data);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      // Logger l'inscription dans MySQL (audit)
      await this.auditLogService.log({
        user_id: result.user?.id,
        action: 'REGISTER',
        resource: 'auth',
        details: { username: data.username, email: data.email },
        ip_address: req.ip
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/login - Connexion d'un utilisateur
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: ILoginData = req.body;
      const result = await this.authService.login(data);

      // Logger la tentative de connexion dans MySQL (audit)
      await this.auditLogService.log({
        user_id: result.user?.id,
        action: result.success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
        resource: 'auth',
        details: { email: data.email },
        ip_address: req.ip
      });

      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/profile - Récupérer le profil de l'utilisateur connecté
   */
  public getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Non authentifié'
        });
        return;
      }

      const profile = await this.authService.getProfile(req.user.userId);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/users - Lister tous les utilisateurs (admin seulement)
   */
  public listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.authService.listUsers();

      res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /auth/users/:id/role - Changer le rôle d'un utilisateur (admin seulement)
   */
  public changeUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Rôle invalide',
          validRoles: Object.values(UserRole)
        });
        return;
      }

      const user = await this.authService.changeUserRole(id, role);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Rôle modifié avec succès',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };
}

