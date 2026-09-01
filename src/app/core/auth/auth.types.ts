export interface StudioUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  lastLoginAtUtc: string | null;
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  expiresIn: number;
  user: StudioUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
