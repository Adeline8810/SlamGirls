import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// --- PARCHE PARA SOCKJS (ARREGLA LA PANTALLA NEGRA) ---
// Define 'global' y 'process' antes de que cargue cualquier otra cosa
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};
// ------------------------------------------------------

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
