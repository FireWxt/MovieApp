import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  isLogin = true;
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService) {}

  toggleForm(): void {
    this.isLogin = !this.isLogin;
    this.error = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    // Validation
    if (!this.email || !this.password) {
      this.error = 'Email et mot de passe requis';
      this.loading = false;
      return;
    }

    if (!this.isLogin && this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      this.loading = false;
      return;
    }

    if (!this.isLogin && this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      this.loading = false;
      return;
    }

    // Timeout de sécurité - désactiver le loading après 10 secondes
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        console.warn('[AUTH] ⏱️ Timeout: requête prend trop longtemps');
        this.loading = false;
        this.error = 'La requête prend trop longtemps. Vérifie ta connexion.';
      }
    }, 10000);

    // Appel au service
    const subscription = this.isLogin
      ? this.authService.login(this.email, this.password)
      : this.authService.signup(this.email, this.password);

    subscription.subscribe(
      (response) => {
        clearTimeout(timeoutId); // Annuler le timeout si succès
        console.log('[AUTH] Authentification réussie:', response);
        this.loading = false;
        // Le service met à jour currentUser$ automatiquement
        // L'app.ts détecte le changement et affiche l'app principale
      },
      (error) => {
        clearTimeout(timeoutId); // Annuler le timeout si erreur
        console.error('[AUTH] Erreur complète:', error);
        this.loading = false; // IMPORTANT: toujours désactiver le loading en cas d'erreur!
        
        // Amélioration du message d'erreur
        if (error.error && error.error.message) {
          this.error = error.error.message;
        } else if (error.message) {
          this.error = error.message;
        } else if (error.statusText) {
          this.error = `Erreur serveur: ${error.statusText} (${error.status})`;
        } else {
          this.error = 'Une erreur est survenue. Veuillez réessayer.';
        }
        
        console.log('[AUTH] Message d\'erreur affiché:', this.error);
      }
    );
  }
}
