import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../../auth/stores/auth.store';
import { ToastService } from '../../shared/components/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      switch (error.status) {
        case HttpStatusCode.Unauthorized:
          authStore.clearSession();
          router.navigate(['/auth/login']);
          break;
        case HttpStatusCode.Forbidden:
          toast.error('You do not have permission to perform this action.');
          break;
        case HttpStatusCode.NotFound:
          toast.warning('The requested resource was not found.');
          break;
        case HttpStatusCode.Conflict:
          toast.warning('A workflow conflict occurred. Please review and try again.');
          break;
        case HttpStatusCode.UnprocessableEntity:
          // Validation errors — let components handle via form errors
          break;
        case HttpStatusCode.InternalServerError:
          toast.error('A system error occurred. Our team has been notified.');
          break;
        case 0: // Network failure
          toast.error('Network connection lost. Working in offline mode.');
          break;
        default:
          if (error.status >= 500) {
            toast.error('An unexpected server error occurred.');
          }
      }
      return throwError(() => error);
    }),
  );
};
