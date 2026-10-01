import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  errorMsg = signal('');
  loading = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    this.errorMsg.set('');
    this.loading.set(true);
    try {
      await this.authService.signIn(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.errorMsg.set('Correo o contraseña incorrectos');
    } finally {
      this.loading.set(false);
    }
  }
}