import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-user-dropdown-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-dropdown-panel.component.html',
  styleUrls: ['./user-dropdown-panel.component.css']
})
export class UserDropdownPanelComponent implements OnInit {
  dropdownOpen = false;
  profileData: any = {};
  passwordForm!: FormGroup;
  apiUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();

    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
    });
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

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.dropdownOpen = false;
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const token = localStorage.getItem('access');
    this.http.post(`${this.apiUrl}/api/users/change-password/`, this.passwordForm.value, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        alert('Contraseña actualizada correctamente');
        this.passwordForm.reset();
        this.dropdownOpen = false;
      },
      error: (err) => {
        console.error('Error al cambiar la contraseña:', err);
        alert('Error al cambiar contraseña');
      }
    });
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.router.navigate(['/']);
  }
}
