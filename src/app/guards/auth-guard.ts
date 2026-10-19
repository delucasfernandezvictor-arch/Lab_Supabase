import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase';

// Solo deja entrar en /home si hay un usuario autenticado
export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  await supabase.ready;
  return supabase.currentUser() ? true : router.createUrlTree(['/login']);
};
