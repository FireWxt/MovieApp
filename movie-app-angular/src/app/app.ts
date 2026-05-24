import { Component } from '@angular/core';
import { MoviesList } from './components/movies-list/movies-list';

@Component({
  selector: 'app-root',
  imports: [MoviesList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
