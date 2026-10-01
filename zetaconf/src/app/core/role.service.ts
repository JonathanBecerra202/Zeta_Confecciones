import { Injectable, signal } from '@angular/core';
import { ProfileService } from '../services/profile.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  isAdmin = signal(false);
  private loaded = false;

  constructor(private profileService: ProfileService) {}

  async ensureLoaded() {
    if (this.loaded) return;
    try {
      const profile = await this.profileService.getCurrentProfile();
      this.isAdmin.set(profile.role_name === 'Admin');
    } catch {
      this.isAdmin.set(false);
    }
    this.loaded = true;
  }
}