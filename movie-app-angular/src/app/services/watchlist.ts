import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private apiUrl = 'http://localhost:3000/api/watchlists';
  private watchlistUpdated = new Subject<void>();

  constructor(private http: HttpClient) { }

  getWatchlistUpdated(): Observable<void> {
    return this.watchlistUpdated.asObservable();
  }

  private notifyUpdate(): void {
    this.watchlistUpdated.next();
  }

  // Récupérer toutes les watchlists
  getAllWatchlists(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Récupérer une watchlist spécifique
  getWatchlist(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle watchlist
  createWatchlist(name: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { name }).pipe(
      tap(() => this.notifyUpdate())
    );
  }

  // Ajouter un film à une watchlist
  addMovieToWatchlist(watchlistId: string, movie: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${watchlistId}/movies`, { movie }).pipe(
      tap(() => this.notifyUpdate())
    );
  }

  // Supprimer un film d'une watchlist
  removeMovieFromWatchlist(watchlistId: string, movieId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${watchlistId}/movies/${movieId}`).pipe(
      tap(() => this.notifyUpdate())
    );
  }

  // Supprimer une watchlist complète
  deleteWatchlist(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.notifyUpdate())
    );
  }

  // Modifier le nom d'une watchlist
  updateWatchlist(id: string, name: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, { name }).pipe(
      tap(() => this.notifyUpdate())
    );
  }
}
