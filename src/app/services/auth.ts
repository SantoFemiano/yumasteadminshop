import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, AuthResponse, RegisterRequest } from '../models/auth';

// 1. ESPORTA LA CHIAVE QUI (fuori dalla classe)
export const TOKEN_KEY = 'yumaste_admin_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiRenderUrlAuth='https://yumaste.duckdns.org/api/auth'
  private apiUrl = 'http://localhost:8084/api/auth';

  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiRenderUrlAuth}/login`, credentials).pipe(
      tap(response => this.saveToken(response.token))
    );
  }

  private saveToken(token: string): void {
    // 2. Usa la costante
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    // 3. Usa la costante
    return localStorage.getItem(TOKEN_KEY);
  }

  logout(): void {
    // 4. Usa la costante
    localStorage.removeItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiRenderUrlAuth}/register`, data).pipe(
      tap(response => this.saveToken(response.token))
    );
  }
}
