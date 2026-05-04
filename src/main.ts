import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // Importa tu configuración real

// Parche para compatibilidad de librerías antiguas
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};

// Arranca la app usando appConfig para que Firebase esté disponible
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
