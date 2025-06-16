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

  const access = localStorage.getItem('access');
  const clonedReq = access
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${access}`) })
    : req;

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

        return http.post<{ access: string }>('/api/token/refresh/', { refresh }).pipe(
          switchMap(response => {
            localStorage.setItem('access', response.access);

            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${response.access}`)
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
