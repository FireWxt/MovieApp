import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Movie {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getGenres(): Observable<any> {
    return this.http.get(`${this.apiUrl}/genres`);
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/movies/search?query=${query}`);
  }

  getMovieCredits(movieId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/movies/${movieId}/credits`);
  }

  getTrendingMovies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/movies/trending`);
  }

  getMoviesByGenre(genreId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/movies/genre/${genreId}`);
  }
}
