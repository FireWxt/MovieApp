import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WatchlistService } from '../../services/watchlist';
import { Movie } from '../../services/movie';

@Component({
  selector: 'app-watchlists',
  imports: [CommonModule, FormsModule],
  templateUrl: './watchlists.html',
  styleUrls: ['./watchlists.css']
})
export class WatchlistsComponent implements OnInit {
  watchlists: any[] = [];
  selectedWatchlist: any = null;
  showForm: boolean = false;
  newWatchlistName: string = '';
  editingId: string | null = null;
  editingName: string = '';
  
  // Pour ajouter des films
  showAddMovieForm: boolean = false;
  availableMovies: any[] = [];
  searchQuery: string = '';
  isLoadingMovies: boolean = false;

  constructor(
    private watchlistService: WatchlistService, 
    private movieService: Movie,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('[WATCHLIST] Initialisation du composant watchlist');
    this.loadWatchlists();
    
    // Écouter les changements de watchlist (film ajouté, supprimé, etc.)
    this.watchlistService.getWatchlistUpdated().subscribe(() => {
      console.log('[WATCHLIST] Changement détecté, rechargement...');
      this.loadWatchlists();
      if (this.selectedWatchlist) {
        this.watchlistService.getWatchlist(this.selectedWatchlist.id).subscribe(
          (updatedWatchlist) => {
            this.selectedWatchlist = updatedWatchlist;
            this.cdr.detectChanges();
          }
        );
      }
    });
  }

  loadWatchlists(): void {
    console.log('[WATCHLIST] Chargement des watchlists depuis le serveur...');
    this.watchlistService.getAllWatchlists().subscribe(
      (data) => {
        console.log('[WATCHLIST] Watchlists chargées:', data);
        this.watchlists = data;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('[WATCHLIST] Erreur lors du chargement des watchlists:', error);
      }
    );
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.newWatchlistName = '';
  }

  createWatchlist(): void {
    if (this.newWatchlistName.trim()) {
      console.log('[WATCHLIST] Création d\'une nouvelle watchlist:', this.newWatchlistName);
      this.watchlistService.createWatchlist(this.newWatchlistName).subscribe(
        () => {
          console.log('[WATCHLIST] Watchlist créée avec succès');
          this.loadWatchlists();
          this.newWatchlistName = '';
          this.showForm = false;
        },
        (error) => {
          console.error('[WATCHLIST] Erreur lors de la création:', error);
        }
      );
    }
  }

  selectWatchlist(watchlist: any): void {
    console.log('[WATCHLIST] Sélection de la watchlist:', watchlist);
    this.selectedWatchlist = watchlist;
  }

  deleteWatchlist(id: string): void {
    console.log('[WATCHLIST] Suppression de la watchlist:', id);
    this.watchlistService.deleteWatchlist(id).subscribe(
      () => {
        console.log('[WATCHLIST] Watchlist supprimée avec succès');
        this.loadWatchlists();
        if (this.selectedWatchlist?.id === id) {
          this.selectedWatchlist = null;
        }
      },
      (error) => {
        console.error('[WATCHLIST] Erreur lors de la suppression:', error);
      }
    );
  }

  removeMovieFromWatchlist(watchlistId: string, movieId: number): void {
    console.log('[WATCHLIST] Suppression du film', movieId, 'de la watchlist', watchlistId);
    this.watchlistService.removeMovieFromWatchlist(watchlistId, movieId).subscribe(
      () => {
        console.log('[WATCHLIST] Film supprimé avec succès');
        const watchlist = this.watchlists.find(w => w.id === watchlistId);
        if (watchlist) {
          watchlist.movies = watchlist.movies.filter((m: any) => m.id !== movieId);
          if (this.selectedWatchlist?.id === watchlistId) {
            this.selectedWatchlist.movies = this.selectedWatchlist.movies.filter((m: any) => m.id !== movieId);
          }
          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.error('[WATCHLIST] Erreur lors de la suppression du film:', error);
      }
    );
  }

  startEditing(watchlist: any): void {
    console.log('[WATCHLIST] Début de l\'édition de:', watchlist.name);
    this.editingId = watchlist.id;
    this.editingName = watchlist.name;
  }

  saveEdit(): void {
    if (this.editingId && this.editingName.trim()) {
      console.log('[WATCHLIST] Sauvegarde de l\'édition:', this.editingName);
      this.watchlistService.updateWatchlist(this.editingId, this.editingName).subscribe(
        () => {
          console.log('[WATCHLIST] Watchlist mise à jour avec succès');
          this.loadWatchlists();
          this.editingId = null;
          this.editingName = '';
        },
        (error) => {
          console.error('[WATCHLIST] Erreur lors de la mise à jour:', error);
        }
      );
    }
  }

  cancelEdit(): void {
    console.log('[WATCHLIST] Annulation de l\'édition');
    this.editingId = null;
    this.editingName = '';
  }

  toggleAddMovieForm(): void {
    this.showAddMovieForm = !this.showAddMovieForm;
    if (this.showAddMovieForm) {
      this.loadTrendingMovies();
    }
  }

  loadTrendingMovies(): void {
    console.log('[WATCHLIST] Chargement des films trending...');
    this.isLoadingMovies = true;
    this.movieService.getTrendingMovies().subscribe(
      (data) => {
        this.availableMovies = data;
        this.isLoadingMovies = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('[WATCHLIST] Erreur lors du chargement des films:', error);
        this.isLoadingMovies = false;
      }
    );
  }

  searchMovies(query: string): void {
    if (query.trim()) {
      console.log('[WATCHLIST] Recherche de films:', query);
      this.isLoadingMovies = true;
      this.movieService.searchMovies(query).subscribe(
        (data) => {
          this.availableMovies = data;
          this.isLoadingMovies = false;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('[WATCHLIST] Erreur lors de la recherche:', error);
          this.isLoadingMovies = false;
        }
      );
    } else {
      this.loadTrendingMovies();
    }
  }

  addMovieToSelectedWatchlist(movie: any): void {
    if (!this.selectedWatchlist) {
      console.warn('[WATCHLIST] Aucune watchlist sélectionnée');
      return;
    }

    console.log('[WATCHLIST] Ajout du film', movie.title, 'à la watchlist', this.selectedWatchlist.name);
    this.watchlistService.addMovieToWatchlist(this.selectedWatchlist.id, movie).subscribe(
      (response) => {
        console.log('[WATCHLIST] Film ajouté avec succès');
        // Recharger la watchlist depuis le serveur pour avoir les données à jour
        this.watchlistService.getWatchlist(this.selectedWatchlist.id).subscribe(
          (updatedWatchlist) => {
            this.selectedWatchlist = updatedWatchlist;
            this.showAddMovieForm = false;
            this.searchQuery = '';
            this.availableMovies = [];
            this.cdr.detectChanges();
          }
        );
      },
      (error) => {
        console.error('[WATCHLIST] Erreur lors de l\'ajout:', error);
      }
    );
  }

  isMovieInWatchlist(movieId: number): boolean {
    if (!this.selectedWatchlist || !this.selectedWatchlist.movies) {
      return false;
    }
    return this.selectedWatchlist.movies.some((m: any) => m.id === movieId);
  }
}
