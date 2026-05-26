import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviesList } from './components/movies-list/movies-list';
import { WatchlistsComponent } from './components/watchlists/watchlists';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MoviesList, WatchlistsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  currentView: 'movies' | 'watchlists' = 'movies';

  switchView(view: 'movies' | 'watchlists'): void {
    this.currentView = view;
  }
}
