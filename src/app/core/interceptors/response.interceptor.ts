import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

interface ApiEnvelope {
  success: boolean;
  data: unknown;
  message?: string;
}

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object' && 'success' in (event.body as Record<string, unknown>) && 'data' in (event.body as Record<string, unknown>)) {
        const body = event.body as ApiEnvelope;
        if (body.success && !('pagination' in event.body)) {
          return event.clone({ body: body.data });
        }
      }
      return event;
    }),
  );
};
