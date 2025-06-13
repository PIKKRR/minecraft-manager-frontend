import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { debounceTime, switchMap } from 'rxjs/operators';
import { NavbarComponent } from '../../components/navbar/navbar.component';

interface FavoriteRecipe {
  id: number;
  recipe: {
    id: number;
    name: string;
    output: {
      name: string;
    };
  };
}

@Component({
  selector: 'app-crafting',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    NavbarComponent,
  ],
  templateUrl: './crafting.component.html',
  styleUrls: ['./crafting.component.css']
})
export class CraftingComponent implements OnInit {
  searchControl = new FormControl('');
  filteredRecipes: any[] = [];
  selectedRecipe?: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(query => {
        const token = localStorage.getItem('access');
        return this.http.get<any[]>(
          `http://localhost:8000/api/crafting/?search=${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      })
    ).subscribe(data => {
      this.filteredRecipes = data;
    });
  }

  selectRecipe(recipe: any) {
    const token = localStorage.getItem('access');
    this.http.get<any>(
      `http://localhost:8000/api/crafting/${recipe.id}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe(data => {
      this.selectedRecipe = data;
    });
  }

  getImage(itemName: string): string {
    if (!itemName) return '';
    return `/icons/${itemName}.png`;
  }

  addToFavorites() {
    const token = localStorage.getItem('access');
    if (!token) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }

    if (!this.selectedRecipe?.id) {
      console.error('No hay receta seleccionada');
      return;
    }

    this.http.post<FavoriteRecipe>(
      'http://localhost:8000/api/crafting/favorites/',
      { recipe: this.selectedRecipe.id },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    ).subscribe({
      next: (response) => {
        console.log('Favorito creado:', response);
        alert('¡Receta añadida a favoritos!');
      },
      error: (err) => {
        console.error('Error al guardar favorito:', err);
        if (err.status === 400) {
          alert(err.error || 'Esta receta ya está en tus favoritos');
        } else if (err.status === 401) {
          alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        } else {
          alert('Error desconocido al guardar favorito');
        }
      }
    });
  }
}
