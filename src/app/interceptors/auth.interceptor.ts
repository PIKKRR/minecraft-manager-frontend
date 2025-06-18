import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const http = inject(HttpClient);
  const router = inject(Router);

  // Clonar la petición con los headers necesarios
  let clonedReq = req.clone({
    withCredentials: true // Importante para CORS con credenciales
  });

  // Agregar token de acceso si existe
  const access = localStorage.getItem('access');
  if (access) {
    clonedReq = clonedReq.clone({
      headers: clonedReq.headers.set('Authorization', `Bearer ${access}`)
    });
  }

  return next(clonedReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        // Token expirado, intenta refrescar
        const refresh = localStorage.getItem('refresh');
        if (!refresh) {
          localStorage.clear();
          router.navigate(['/']);
          return throwError(() => err);
        }

        return http.post<{ access: string }>('/api/token/refresh/', { refresh }, {
          withCredentials: true // Asegurar CORS en la petición de refresh
        }).pipe(
          switchMap(response => {
            localStorage.setItem('access', response.access);

            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${response.access}`),
              withCredentials: true
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            localStorage.clear();
            router.navigate(['/']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
