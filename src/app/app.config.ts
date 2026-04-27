import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes'; // 👈 ASEGÚRATE DE IMPORTAR TUS RUTAS

export const appConfig: ApplicationConfig = {
 providers: [
    provideRouter(routes), // 👈 CAMBIA EL [] POR 'routes'
    provideHttpClient(),
    provideAnimationsAsync()
    //cambio 2
  ]
};
