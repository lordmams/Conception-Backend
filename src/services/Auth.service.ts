import { UserMySQLModel } from '../models/User.mysql.model';
import { IRegisterData, ILoginData, IAuthResponse, UserRole } from '../types/auth.types';
import { generateToken } from '../utils/jwt.utils';

/**
 * Service pour la gestion de l'authentification
 * Utilise MySQL pour stocker les utilisateurs (données structurées)
 */
export class AuthService {
  private userModel: UserMySQLModel;

  constructor() {
    this.userModel = new UserMySQLModel();
  }
  /**
   * Inscription d'un nouvel utilisateur
   */
  public async register(data: IRegisterData): Promise<IAuthResponse> {
    try {
      // Vérifier si l'email existe déjà
      const existingUserByEmail = await this.userModel.findByEmail(data.email);
      if (existingUserByEmail) {
        return {
          success: false,
          message: 'Cet email est déjà utilisé'
        };
      }

      // Vérifier si le nom d'utilisateur existe déjà
      const existingUserByUsername = await this.userModel.findByUsername(data.username);
      if (existingUserByUsername) {
        return {
          success: false,
          message: 'Ce nom d\'utilisateur est déjà pris'
        };
      }

      // Créer le nouvel utilisateur dans MySQL
      const user = await this.userModel.create({
        username: data.username,
        email: data.email,
        password: data.password,
        role: UserRole.USER // Rôle par défaut
      });

      // Générer le token JWT
      const token = generateToken({
        userId: user.id!.toString(),
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        message: 'Inscription réussie',
        token,
        user: {
          id: user.id!.toString(),
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message.includes('existe déjà') ? error.message : 'Erreur lors de l\'inscription'
        };
      }
      throw error;
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  public async login(data: ILoginData): Promise<IAuthResponse> {
    try {
      // Rechercher l'utilisateur par email avec son mot de passe
      const user = await this.userModel.findByEmailWithPassword(data.email);

      if (!user) {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }

      // Vérifier le mot de passe
      const isPasswordValid = await this.userModel.comparePassword(data.password, user.password!);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }

      // Générer le token JWT
      const token = generateToken({
        userId: user.id!.toString(),
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id!.toString(),
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la connexion: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Récupérer les informations du profil utilisateur
   */
  public async getProfile(userId: string) {
    try {
      const user = await this.userModel.findById(parseInt(userId));

      if (!user) {
        return null;
      }

      return {
        id: user.id!.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la récupération du profil: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Lister tous les utilisateurs (admin seulement)
   */
  public async listUsers() {
    try {
      const users = await this.userModel.findAll();
      return users.map(user => ({
        id: user.id!.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Changer le rôle d'un utilisateur (admin seulement)
   */
  public async changeUserRole(userId: string, newRole: UserRole) {
    try {
      const user = await this.userModel.updateRole(parseInt(userId), newRole);

      return {
        id: user.id!.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors du changement de rôle: ${error.message}`);
      }
      throw error;
    }
  }
}

