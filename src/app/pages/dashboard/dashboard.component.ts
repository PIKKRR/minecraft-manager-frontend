import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { NotificationService } from '../../services/notification.service';
import { RouterModule } from '@angular/router';

interface RecipeOutput {
  name: string;
}

interface Recipe {
  id: number;
  name: string;
  output?: RecipeOutput;
}

interface Favorite {
  id: number;
  recipe: Recipe;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  favorites: Favorite[] = [];
  isLoading = true;
  apiUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
  const token = localStorage.getItem('access');
  this.http.get<any>(`http://localhost:8000/api/crafting/favorites/`, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: (response) => {
      console.log('Respuesta de favoritos:', response);
      this.favorites = response;  // Asegúrate que response contiene los datos esperados
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error completo:', err);
      this.notificationService.showError('Error al cargar favoritos');
      this.isLoading = false;
    }
  });
}

  getImage(itemName: string | undefined): string {
  if (!itemName || itemName.trim() === '') {
    return '/icons/default-item.png';
  }

  const safeName = itemName
    .toLowerCase()
    .normalize("NFD")               // Quita tildes
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos
    .replace(/\s+/g, '-')            // Espacios por guiones
    .replace(/[^a-z0-9\-]/g, '');    // Elimina caracteres no válidos

  return `/icons/${safeName}.png`;
}


  handleImageError(event: Event): void {
  const imgElement = event.target as HTMLImageElement;
  if (!imgElement.src.endsWith('default-item.png')) {
    imgElement.src = '/icons/default-item.png';
  }
}


  deleteFavorite(favoriteId: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!confirm('¿Estás seguro de que quieres eliminar esta receta de favoritos?')) return;

    const token = localStorage.getItem('access');
    this.http.delete(`${this.apiUrl}/api/crafting/favorites/${favoriteId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.id !== favoriteId);
        this.notificationService.showSuccess('Receta eliminada de favoritos');
      },
      error: (err) => {
        console.error('Error deleting favorite:', err);
        this.notificationService.showError('Error al eliminar favorito');
      }
    });
  }
}
