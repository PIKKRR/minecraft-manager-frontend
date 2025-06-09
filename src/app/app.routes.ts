import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CraftingComponent } from './pages/crafting/crafting.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './auth-guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'crafting', component: CraftingComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
