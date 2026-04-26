import { Component, OnInit } from '@angular/core'; // Añadimos OnInit
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Importante para el ping
import { MenuBarComponent } from '../../components/menu-bar/menu-bar.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuBarComponent],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit { // Implementamos OnInit

  constructor(
    private router: Router,
    private http: HttpClient // Inyectamos HttpClient
  ) {}

  ngOnInit() {
    // URL de tu servidor en Render
    const urlPing = 'https://backend-ruth-slam.onrender.com/api/usuarios/ping';
    https://backend-ruth-slam.onrender.com/api/usuarios/ping

    console.log('--- Despertando Servidor ---');

    // Petición silenciosa para que Render empiece a arrancar (los 2 min de espera)
    this.http.get(urlPing, { responseType: 'text' }).subscribe({
      next: () => console.log('✅ Servidor activo'),
      error: () => console.log('⏳ Servidor despertando en segundo plano...')
    });
  }

  go(path: string) {
    this.router.navigate([path]);
  }
}
