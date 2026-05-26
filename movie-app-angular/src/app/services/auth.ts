import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier si l'utilisateur est déjà connecté
    this.checkAuthStatus();
  }

  private getUserFromStorage(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private checkAuthStatus(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getUserFromStorage();
  }

  getCurrentUser(): any {
    return this.getUserFromStorage();
  }

  signup(email: string, password: string): Observable<any> {
    console.log('[AUTH] signup() appelé avec email:', email);
    return this.http.post<any>(`${this.apiUrl}/signup`, { email, password }).pipe(
      tap(response => {
        console.log('[AUTH] ✅ Réponse signup reçue:', response);
        this.saveUserData(response);
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    console.log('[AUTH] login() appelé avec email:', email);
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        console.log('[AUTH] ✅ Réponse login reçue:', response);
        this.saveUserData(response);
      })
    );
  }

  private saveUserData(response: any): void {
    console.log('[AUTH] 🔍 saveUserData() appelé');
    console.log('[AUTH] Response reçue:', response);
    console.log('[AUTH] userId:', response.userId);
    console.log('[AUTH] email:', response.email);
    console.log('[AUTH] accessToken existe:', !!response.accessToken);
    console.log('[AUTH] refreshToken existe:', !!response.refreshToken);
    
    const userData = {
      userId: response.userId,
      email: response.email,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    console.log('[AUTH] ✅ currentUser sauvegardé');
    
    localStorage.setItem('accessToken', response.accessToken);
    console.log('[AUTH] ✅ accessToken sauvegardé:', response.accessToken.substring(0, 20) + '...');
    
    localStorage.setItem('refreshToken', response.refreshToken);
    console.log('[AUTH] ✅ refreshToken sauvegardé');
    
    this.currentUserSubject.next(userData);
    console.log('[AUTH] ✅ currentUserSubject mis à jour');
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Appeler le logout endpoint (optionnel)
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe(
        () => {
          this.clearUserData();
        },
        () => {
          this.clearUserData();
        }
      );
    } else {
      this.clearUserData();
    }
  }

  private clearUserData(): void {
    console.log('[AUTH] Effacement des données utilisateur');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
      })
    );
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem('accessToken');
    console.log('[AUTH] getAccessToken() appelé - Token existe:', !!token);
    if (token) {
      console.log('[AUTH] Token récupéré:', token.substring(0, 20) + '...');
    }
    return token;
  }
}
