import { Component, OnInit } from '@angular/core';
import { Movie } from '../../services/movie';
import { CommonModule } from '@angular/common';
import { MovieDetails } from '../movie-details/movie-details';

@Component({
  selector: 'app-movies-list',
  imports: [CommonModule, MovieDetails],
  templateUrl: './movies-list.html',
  styleUrl: './movies-list.css'
})
export class MoviesList implements OnInit {
  movies: any[] = [];
  genres: any[] = [];
  selectedGenre: number | null = null;
  selectedMovie: any = null;
  selectedMovieCredits: any = null;

  constructor(private movieService: Movie) { }

  ngOnInit(): void {
    this.loadTrendingMovies();
    this.loadGenres();
  }

  loadTrendingMovies(): void {
    this.movieService.getTrendingMovies().subscribe(data => {
      this.movies = data;
    });
  }

  loadGenres(): void {
    this.movieService.getGenres().subscribe(data => {
      this.genres = data;
    });
  }

  loadMoviesByGenre(genreId: number): void {
    this.selectedGenre = genreId;
    this.movieService.getMoviesByGenre(genreId).subscribe(data => {
      this.movies = data;
    });
  }

  searchMovies(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;
    if (query) {
      this.movieService.searchMovies(query).subscribe(data => {
        this.movies = data;
      });
    } else {
      this.loadTrendingMovies();
    }
  }

  selectMovie(movie: any): void {
    this.selectedMovie = movie;
    this.movieService.getMovieCredits(movie.id).subscribe(credits => {
      this.selectedMovieCredits = credits;
    });
  }

  closeDetails(): void {
    this.selectedMovie = null;
    this.selectedMovieCredits = null;
    // Re-render the list to update favorite status
    if (this.selectedGenre) {
      this.loadMoviesByGenre(this.selectedGenre);
    } else {
      this.loadTrendingMovies();
    }
  }
}
