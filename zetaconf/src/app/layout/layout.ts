import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ProfileService, CurrentProfile } from '../services/profile.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  profile = signal<CurrentProfile | null>(null);

  baseTabs = [
    { path: 'dashboard', label: 'Dashboard' },
    { path: 'clientes', label: 'Clientes' },
    { path: 'organizaciones', label: 'Organizaciones' },
    { path: 'dependencias', label: 'Dependencias' },
    { path: 'pedidos', label: 'Pedidos' }
  ];

  constructor(private authService: AuthService, private profileService: ProfileService, private router: Router) {}

  tabs() {
    if (this.profile()?.role_name === 'Admin') {
      return [...this.baseTabs, { path: 'auditorias', label: 'Auditoría' }];
    }
    return this.baseTabs;
  }

  async ngOnInit() {
    try {
      const profile = await this.profileService.getCurrentProfile();
      this.profile.set(profile);
    } catch (err) {
      console.error('No se pudo cargar el perfil', err);
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}