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
    return this.http.post<any>(`${this.apiUrl}/signup`, { email, password }).pipe(
      tap(response => {
        this.saveUserData(response);
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        this.saveUserData(response);
      })
    );
  }

  private saveUserData(response: any): void {
    const userData = {
      userId: response.userId,
      email: response.email,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    this.currentUserSubject.next(userData);
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
    return localStorage.getItem('accessToken');
  }
}
