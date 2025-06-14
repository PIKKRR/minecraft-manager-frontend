import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { NotificationService } from '../../services/notification.service';
import { NotificationComponent } from '../../components/notifications/notification.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    NavbarComponent,
    NotificationComponent,
    RouterModule
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  profileData: any = {};
  passwordForm!: FormGroup;
  apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadProfile();

    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  loadProfile(): void {
    const token = localStorage.getItem('access');
    this.http.get(`${this.apiUrl}/api/users/profile/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: data => this.profileData = data,
      error: err => console.error('Error loading profile:', err)
    });
  }

  passwordsMatch(group: AbstractControl) {
    const newPass = group.get('new_password')?.value;
    const confirmPass = group.get('confirm_password')?.value;
    return newPass === confirmPass ? null : { notMatching: true };
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const token = localStorage.getItem('access');
    this.http.post(`${this.apiUrl}/api/users/change-password/`, {
      old_password: this.passwordForm.value.old_password,
      new_password: this.passwordForm.value.new_password
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        alert('Contraseña actualizada correctamente');
        this.passwordForm.reset();
      },
      error: err => {
        console.error('Error al cambiar la contraseña:', err);
        alert('Error al cambiar contraseña');
      }
    });
  }
}
