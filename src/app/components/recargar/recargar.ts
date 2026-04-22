import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecargarService } from '../../../services/recargar.service';

@Component({
  selector: 'app-recargar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recargar.html',
  styleUrl: './recargar.css'
})
export class Recargar implements OnInit {
  usuarioActual: any = { username: '', monedas: 0 };
  cargando: boolean = true;

  constructor(private recargarService: RecargarService) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Aquí usamos el username que tengas guardado al iniciar sesión
    const user = localStorage.getItem('username') || 'ruth';
    this.recargarService.obtenerPerfil(user).subscribe({
      next: (data) => {
        this.usuarioActual = data;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  contactarWhatsApp(cantidad: number, precio: number) {
    const url = this.recargarService.generarLinkWhatsApp(
      this.usuarioActual.username,
      cantidad,
      precio
    );
    window.open(url, '_blank');
  }

  irAtras() {
    window.history.back();
  }

  verDetalles() {
    // Por si quieren ver el historial de compras
    console.log("Détails du compte cliqué");
  }

  obtenerTiempo() { return new Date().getTime(); }
}
