import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviesList } from './components/movies-list/movies-list';
import { WatchlistsComponent } from './components/watchlists/watchlists';
import { AuthComponent } from './components/auth/auth';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MoviesList, WatchlistsComponent, AuthComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  currentView: 'movies' | 'watchlists' = 'movies';
  isAuthenticated = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Vérifier l'état d'authentification initial
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();

    // Écouter les changements d'authentification
    this.authService.currentUser$.subscribe(user => {
      console.log('[APP] Changement d\'authentification:', user);
      this.isAuthenticated = !!user;
      this.currentUser = user;
      // Forcer la détection de changement
      this.cdr.detectChanges();
    });
  }

  switchView(view: 'movies' | 'watchlists'): void {
    this.currentView = view;
  }

  logout(): void {
    console.log('[APP] Déconnexion...');
    this.authService.logout();
  }
}
