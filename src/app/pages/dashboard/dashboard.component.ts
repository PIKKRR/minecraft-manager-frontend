import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  favorites: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    const token = localStorage.getItem('access');
    this.http.get<any[]>('http://localhost:8000/api/crafting/favorites/', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => this.favorites = data,
      error: (err) => console.error('Error loading favorites:', err)
    });
  }

  deleteFavorite(favoriteId: number, event: Event): void {
    event.stopPropagation();

    if (!confirm('¿Eliminar esta receta de favoritos?')) return;

    const token = localStorage.getItem('access');
    this.http.delete(`http://localhost:8000/api/crafting/favorites/${favoriteId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => this.loadFavorites(),
      error: (err) => console.error('Error deleting favorite:', err)
    });
  }

  getImage(itemName: string): string {
    return `/icons/${itemName}.png`;
  }
}
