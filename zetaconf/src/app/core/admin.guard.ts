import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';

export const adminGuard: CanActivateFn = async () => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  try {
    const profile = await profileService.getCurrentProfile();
    if (profile.role_name === 'Admin') {
      return true;
    }
  } catch {
    // si falla la consulta del perfil, se bloquea por defecto abajo
  }

  router.navigate(['/dashboard']);
  return false;
};