import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Actor {
  profile_path: string;
  name: string;
  character: string;
}

@Component({
  selector: 'app-movie-details',
  imports: [CommonModule],
  templateUrl: './movie-details.html',
  styleUrls: ['./movie-details.css']
})
export class MovieDetails {
  @Input() movie: any;
  @Input() credits: { cast: Actor[] } | null = null;
  @Output() close = new EventEmitter<void>();

  isFavorite(movieId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some((fav: any) => fav.id === movieId);
  }

  toggleFavorite(movie: any): void {
    let favorites = this.getFavorites();
    if (this.isFavorite(movie.id)) {
      favorites = favorites.filter((fav: any) => fav.id !== movie.id);
    } else {
      // Sauvegarder le film avec toutes ses propriétés
      // Cela inclut genre_ids si disponible
      const movieToSave = { ...movie };
      favorites.push(movieToSave);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    this.close.emit();
  }

  private getFavorites(): any[] {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
  }

  onClose(): void {
    this.close.emit();
  }
}
