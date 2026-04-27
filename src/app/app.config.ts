import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router'; // 👈 CAMBIADO A withHashLocation
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Ahora sí, esta es la función correcta para Angular 18
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    provideAnimationsAsync()
  ]
};
