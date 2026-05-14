import { ApplicationConfig, provideZoneChangeDetection, isDevMode, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { organizationInterceptor } from './core/interceptors/organization.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { API_CONFIG } from './core/tokens/api-config.token';
import { environment } from '@env/environment';
import { AuthStore } from './auth/stores/auth.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
    ),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        organizationInterceptor,
        errorInterceptor,
      ]),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: API_CONFIG,
      useValue: {
        apiBaseUrl: environment.apiBaseUrl,
        wsBaseUrl: environment.wsBaseUrl,
      },
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authStore = inject(AuthStore);
        return () => authStore.hydrateFromStorage();
      },
      multi: true,
    },
    provideEchartsCore({ echarts }),
  ],
};
