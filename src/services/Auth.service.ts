import { UserModel } from '../models/User.model';
import { IRegisterData, ILoginData, IAuthResponse, UserRole } from '../types/auth.types';
import { generateToken } from '../utils/jwt.utils';

/**
 * Service pour la gestion de l'authentification
 */
export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  public async register(data: IRegisterData): Promise<IAuthResponse> {
    try {
      // Vérifier si l'email existe déjà
      const existingUserByEmail = await UserModel.findOne({ email: data.email });
      if (existingUserByEmail) {
        return {
          success: false,
          message: 'Cet email est déjà utilisé'
        };
      }

      // Vérifier si le nom d'utilisateur existe déjà
      const existingUserByUsername = await UserModel.findOne({ username: data.username });
      if (existingUserByUsername) {
        return {
          success: false,
          message: 'Ce nom d\'utilisateur est déjà pris'
        };
      }

      // Créer le nouvel utilisateur
      const user = new UserModel({
        username: data.username,
        email: data.email,
        password: data.password,
        role: UserRole.USER // Rôle par défaut
      });

      await user.save();

      // Générer le token JWT
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        message: 'Inscription réussie',
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de l'inscription: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  public async login(data: ILoginData): Promise<IAuthResponse> {
    try {
      // Rechercher l'utilisateur par email (inclure le password)
      const user = await UserModel.findOne({ email: data.email }).select('+password');

      if (!user) {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }

      // Vérifier si le compte est actif
      if (!user.isActive) {
        return {
          success: false,
          message: 'Votre compte a été désactivé'
        };
      }

      // Vérifier le mot de passe
      const isPasswordValid = await user.comparePassword(data.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Email ou mot de passe incorrect'
        };
      }

      // Générer le token JWT
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        message: 'Connexion réussie',
        token,
        user: {
          id: user._id.toString(),
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
      const user = await UserModel.findById(userId);

      if (!user) {
        return null;
      }

      return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
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
      const users = await UserModel.find().select('-password');
      return users;
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
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true }
      ).select('-password');

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors du changement de rôle: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Désactiver un utilisateur (admin seulement)
   */
  public async deactivateUser(userId: string) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      ).select('-password');

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la désactivation: ${error.message}`);
      }
      throw error;
    }
  }
}

