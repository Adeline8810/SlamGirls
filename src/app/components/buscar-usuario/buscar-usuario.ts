import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TraduccionService } from '../../../services/traduccion.service';

@Component({
  selector: 'app-buscar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-usuario.html',
  styleUrl: './buscar-usuario.css'
})
export class BuscarUsuario {
  busqueda: string = '';
  usuarios = signal<any[]>([]);
  cargando = signal<boolean>(false);

  constructor(
    private miServicio: TraduccionService,
    private router: Router
  ) {}

  buscar() {
    if (!this.busqueda.trim()) return;
    this.cargando.set(true);

    this.miServicio.buscarUsuarios(this.busqueda).subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  verPerfil(username: string) {
    // Esta ruta la usaremos para ver los regalos y videos del otro
    this.router.navigate(['/perfil', username]);
  }
}
