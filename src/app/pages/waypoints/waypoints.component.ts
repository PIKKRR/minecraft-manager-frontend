import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar.component';

interface World {
  id: number;
  name: string;
}

interface Waypoint {
  id?: number;
  name: string;
  x: number;
  y: number;
  z: number;
  notes?: string;
  world_id?: number;
}

@Component({
  selector: 'app-waypoints',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NavbarComponent
  ],
  templateUrl: './waypoints.component.html',
  styleUrls: ['./waypoints.component.css']
})
export class WaypointsComponent implements OnInit {
  worlds: World[] = [];
  waypoints: Waypoint[] = [];

  selectedWorld: World | null = null;
  selectedWaypoint: Waypoint | null = null;

  isAddingWorld = false;
  isAddingWaypoint = false;
  newWorldName = '';

  currentWaypoint: Waypoint = {
    name: '',
    x: 0,
    y: 0,
    z: 0,
    notes: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadWorlds();
  }

  loadWorlds(): void {
    const token = localStorage.getItem('access');
    this.http.get<World[]>('http://localhost:8000/api/waypoints/worlds/', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (worlds) => {
        this.worlds = worlds;
        if (worlds.length > 0 && !this.selectedWorld) {
          this.selectWorld(worlds[0]);
        }
      },
      error: (err) => console.error('Error loading worlds:', err)
    });
  }

  selectWorld(world: World): void {
    this.selectedWorld = world;
    this.loadWaypoints(world.id);
    this.resetWaypointForms();
  }

  loadWaypoints(worldId: number): void {
    const token = localStorage.getItem('access');
    this.http.get<Waypoint[]>(`http://localhost:8000/api/waypoints/worlds/${worldId}/waypoints/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (waypoints) => this.waypoints = waypoints,
      error: (err) => console.error('Error loading waypoints:', err)
    });
  }

  showAddWorldForm(): void {
    this.isAddingWorld = true;
    this.newWorldName = '';
  }

  cancelAddWorld(): void {
    this.isAddingWorld = false;
  }

  addWorld(): void {
    if (!this.newWorldName.trim()) return;

    const token = localStorage.getItem('access');
    this.http.post<World>('http://localhost:8000/api/waypoints/worlds/',
      { name: this.newWorldName },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: (world) => {
        this.worlds.push(world);
        this.isAddingWorld = false;
        this.selectWorld(world);
      },
      error: (err) => console.error('Error adding world:', err)
    });
  }

  showAddWaypointForm(): void {
    if (!this.selectedWorld) return;

    this.isAddingWaypoint = true;
    this.selectedWaypoint = null;
    this.currentWaypoint = {
      name: '',
      x: 0,
      y: 64,  // Valor por defecto común en Minecraft
      z: 0,
      notes: '',
      world_id: this.selectedWorld.id
    };
  }

  editWaypoint(waypoint: Waypoint): void {
    this.selectedWaypoint = waypoint;
    this.isAddingWaypoint = false;
    this.currentWaypoint = { ...waypoint };
  }

  saveWaypoint(): void {
    if (!this.selectedWorld) return;

    const token = localStorage.getItem('access');
    const waypointData = {
      ...this.currentWaypoint,
      world_id: this.selectedWorld.id
    };

    const request = this.selectedWaypoint
      ? this.http.put<Waypoint>(
          `http://localhost:8000/api/waypoints/waypoints/${this.selectedWaypoint.id}/`,
          waypointData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      : this.http.post<Waypoint>(
          'http://localhost:8000/api/waypoints/waypoints/',
          waypointData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

    request.subscribe({
      next: (waypoint) => {
        this.loadWaypoints(this.selectedWorld!.id);
        this.resetWaypointForms();
      },
      error: (err) => console.error('Error saving waypoint:', err)
    });
  }

  deleteWaypoint(waypointId: number | undefined): void {
  if (waypointId === undefined) {
    console.error('No se puede eliminar un waypoint sin ID');
    return;
  }

  if (!confirm('¿Estás seguro de que quieres eliminar este waypoint?')) return;

  const token = localStorage.getItem('access');
  this.http.delete(`http://localhost:8000/api/waypoints/waypoints/${waypointId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: () => {
      if (this.selectedWorld) {
        this.loadWaypoints(this.selectedWorld.id);
      }
      this.resetWaypointForms();
    },
    error: (err) => console.error('Error deleting waypoint:', err)
  });
}

  resetWaypointForms(): void {
    this.isAddingWaypoint = false;
    this.selectedWaypoint = null;
    this.currentWaypoint = {
      name: '',
      x: 0,
      y: 0,
      z: 0,
      notes: ''
    };
  }
}
