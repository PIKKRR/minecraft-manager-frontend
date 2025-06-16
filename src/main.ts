import { bootstrapApplication } from '@angular/platform-browser';
import { MainComponent } from './main.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';

import { AuthInterceptor } from './app/interceptors/auth.interceptor'; // Ajusta la ruta si es diferente

bootstrapApplication(MainComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    )
  ]
});
