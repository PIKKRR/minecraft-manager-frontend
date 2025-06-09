import { bootstrapApplication } from '@angular/platform-browser';
import { MainComponent } from './main.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';

bootstrapApplication(MainComponent, {
  providers: [provideRouter(routes), provideHttpClient()]
});
