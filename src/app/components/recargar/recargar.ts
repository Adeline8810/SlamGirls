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
    // 1. Obtenemos el nombre de usuario del localStorage
    const user = localStorage.getItem('username') || 'ruth';

    // 2. Llamamos al método del servicio (el que creamos con /api/usuarios/monedas/)
    this.recargarService.obtenerDatosUsuario(user).subscribe({
      next: (data) => {
        // 3. Asignamos los datos recibidos (que incluyen las monedas) a nuestra variable
        this.usuarioActual = data;
        this.cargando = false;
        console.log('Datos cargados:', data);
      },
      error: (err) => {
        console.error('Error al obtener monedas', err);
        this.cargando = false;
      }
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
