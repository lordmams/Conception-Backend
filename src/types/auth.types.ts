import { Document, Types } from 'mongoose';

/**
 * Rôles utilisateur pour l'autorisation
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

/**
 * Interface représentant un utilisateur
 */
export interface IUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface pour le document Mongoose User
 */
export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Interface pour les données d'inscription
 */
export interface IRegisterData {
  username: string;
  email: string;
  password: string;
}

/**
 * Interface pour les données de connexion
 */
export interface ILoginData {
  email: string;
  password: string;
}

/**
 * Interface pour le payload du token JWT
 */
export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Interface pour la réponse d'authentification
 */
export interface IAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Extension de l'interface Request d'Express pour inclure l'utilisateur
 */
export interface IAuthRequest extends Request {
  user?: IJwtPayload;
}

