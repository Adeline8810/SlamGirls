import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';

// FIREBASE
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environment'; // 👈 CORREGIDO: Ruta estándar de Angular

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()), // withHashLocation ayuda mucho en GitHub Pages
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),

    // Inicialización de Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // Auth es vital para que el LoginComponent no de error NG0201
    provideAuth(() => getAuth()),

    // Firestore para tus bases de datos
    provideFirestore(() => getFirestore())
  ]
};
