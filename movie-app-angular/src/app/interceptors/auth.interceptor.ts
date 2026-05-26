import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('[INTERCEPTOR] Requête interceptée:', req.method, req.url);
  
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (token) {
    console.log('[INTERCEPTOR] ✅ Token trouvé, ajout du header Authorization');
    // Cloner la requête et ajouter le header Authorization
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('[INTERCEPTOR] Header Authorization ajouté');
  } else {
    console.log('[INTERCEPTOR] ❌ Pas de token disponible - requête envoyée sans auth');
  }

  return next(req);
};
