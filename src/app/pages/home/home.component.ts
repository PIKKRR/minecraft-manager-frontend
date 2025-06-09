import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // Login
  username = '';
  password = '';
  loginMessage = '';

  // Registro
  regUsername = '';
  regEmail = '';
  regPassword = '';
  registerMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        console.log('✅ Login exitoso:', res);
        localStorage.setItem('access', res.access);
        localStorage.setItem('refresh', res.refresh);
        this.loginMessage = '✅ Login correcto';
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Error al hacer login:', err);
        this.loginMessage = '❌ Usuario o contraseña incorrectos';
      }
    });
  }

  register() {
  this.auth.register({
    username: this.regUsername,
    email: this.regEmail,
    password: this.regPassword
  }).subscribe({
    next: (res: any) => {
      console.log('✅ Registro exitoso:', res);
      this.registerMessage = '✅ Registro exitoso';
    },
    error: (err) => {
      console.error('❌ Error al registrar:', err);

      if (err.status === 400 && err.error) {
        if (err.error.username) {
          this.registerMessage = '❌ ' + err.error.username[0];
        } else if (err.error.email) {
          this.registerMessage = '❌ ' + err.error.email[0];
        } else {
          this.registerMessage = '❌ Error en los datos enviados.';
        }
      } else {
        this.registerMessage = '❌ Error inesperado al registrar.';
      }
    }
  });
}
}
