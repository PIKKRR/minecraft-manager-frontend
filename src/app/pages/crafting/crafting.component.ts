import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';
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
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Cargar todas las recetas al inicio
    this.loadAllRecipes();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(query => {
        return this.http.get<any[]>(
          `http://localhost:8000/api/crafting/?search=${query}`,
          this.getAuthHeaders()
        );
      })
    ).subscribe(data => {
      this.filteredRecipes = data;
    });
  }

  loadAllRecipes() {
    const token = localStorage.getItem('access');
    this.isLoading = true;
    this.http.get<any[]>(
      'http://localhost:8000/api/crafting/',
      this.getAuthHeaders()
    ).subscribe({
      next: (data) => {
        this.filteredRecipes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar recetas:', err);
        this.isLoading = false;
      }
    });
  }

  selectRecipe(recipe: any) {
    const token = localStorage.getItem('access');
    this.http.get<any>(
      `http://localhost:8000/api/crafting/${recipe.id}/`,
      this.getAuthHeaders()
    ).subscribe(data => {
      this.selectedRecipe = data;
    });
  }

  getImage(itemName: string): string {
    if (!itemName) return '';
    return `/icons/${itemName}.png`;
  }

  addToFavorites() {
  if (!this.selectedRecipe?.id) {
    console.error('No hay receta seleccionada');
    return;
  }

  const token = localStorage.getItem('access');
  if (!token) {
    alert('No estás autenticado. Por favor inicia sesión.');
    return;
  }

  const favoriteData = {
    recipe_id: this.selectedRecipe.id
  };

  this.http.post<FavoriteRecipe>(
    'http://localhost:8000/api/crafting/favorites/',
    favoriteData,
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
      console.error('Error completo:', err);
      if (err.status === 400) {
        // Mostrar el mensaje de error específico del backend
        const errorMsg = err.error?.detail ||
                         err.error?.message ||
                         'Esta receta ya está en tus favoritos o los datos son inválidos';
        alert(errorMsg);
      } else if (err.status === 401) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      } else {
        alert(`Error al guardar favorito: ${err.statusText}`);
      }
    }
  });
}

  private getAuthHeaders() {
    const token = localStorage.getItem('access');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }
}
