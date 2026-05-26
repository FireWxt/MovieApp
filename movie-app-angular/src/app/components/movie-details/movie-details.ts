import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistService } from '../../services/watchlist';

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
export class MovieDetails implements OnInit {
  @Input() movie: any;
  @Input() credits: { cast: Actor[] } | null = null;
  @Output() close = new EventEmitter<void>();

  watchlists: any[] = [];
  showWatchlistDropdown: boolean = false;

  constructor(private watchlistService: WatchlistService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadWatchlists();
  }

  loadWatchlists(): void {
    this.watchlistService.getAllWatchlists().subscribe(data => {
      this.watchlists = data;
      this.cdr.detectChanges();
    });
  }

  toggleWatchlistDropdown(): void {
    // Si une seule watchlist, l'ajouter directement
    if (this.watchlists.length === 1) {
      this.addMovieToWatchlist(this.watchlists[0].id);
      return;
    }
    
    // Sinon afficher le dropdown
    this.showWatchlistDropdown = !this.showWatchlistDropdown;
    console.log('[DEBUG] Bouton watchlist cliqué - Movie:', this.movie?.title);
    console.log('[DEBUG] Watchlists disponibles:', this.watchlists);
  }

  addMovieToWatchlist(watchlistId: string): void {
    console.log('[DEBUG] Tentative d\'ajouter le film:', this.movie?.title, 'à la watchlist:', watchlistId);
    console.log('[DEBUG] Données du film:', this.movie);
    
    this.watchlistService.addMovieToWatchlist(watchlistId, this.movie).subscribe(
      (response) => {
        console.log('[DEBUG] Succès! Film ajouté à la watchlist:', response);
        this.showWatchlistDropdown = false;
        this.loadWatchlists();
      },
      (error) => {
        console.error('[DEBUG] Erreur lors de l\'ajout du film:', error);
      }
    );
  }

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

