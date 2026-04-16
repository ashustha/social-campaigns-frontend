export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AdminUser;
}
