import { Component, input, output, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecargarService } from '../../../services/recargar.service'; // Tu servicio de la imagen

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-detail.html',
  styleUrl: './video-detail.css'
})
export class VideoDetail implements OnInit {
  private recargarService = inject(RecargarService);

  video = input.required<any>();
  close = output<void>();

  misMonedas = signal<number>(0);
  regaloSeleccionado = signal<any>(null);
  efectoActivo = signal<string | null>(null); // Para la animación

  listaRegalos = [
    { id: 1, nombre: 'Rose', precio: 3, icon: 'assets/gifts/rose.png' },
    { id: 2, nombre: 'Microphone', precio: 9, icon: 'assets/gifts/mic.png' },
    { id: 3, nombre: 'Songful', precio: 18, icon: 'assets/gifts/songful.png' },
    { id: 4, nombre: 'Glow sticks', precio: 48, icon: 'assets/gifts/glow.png' },
    { id: 5, nombre: 'Music Box', precio: 60, icon: 'assets/gifts/music.png' },
    { id: 6, nombre: 'Ferrari', precio: 3000, icon: 'assets/gifts/ferrari.png' },
    { id: 7, nombre: 'Pearl', precio: 200, icon: 'assets/gifts/pearl.png' }
  ];

  ngOnInit() {
    this.obtenerMonedas();
  }

  obtenerMonedas() {
    // Jalamos el username del localStorage o del objeto usuario
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const user = JSON.parse(userJson);
      // Usamos tu service: obtenerDatosUsuario(username)
      this.recargarService.obtenerDatosUsuario(user.username).subscribe({
        next: (data) => {
          this.misMonedas.set(data.monedas);
        },
        error: (err) => console.error('Error al jalar monedas', err)
      });
    }
  }

  seleccionarRegalo(regalo: any) {
    this.regaloSeleccionado.set(regalo);
  }

  lanzarRegalo() {
    const regalo = this.regaloSeleccionado();
    if (!regalo || this.misMonedas() < regalo.precio) {
      alert("Monedas insuficientes");
      return;
    }

    // 1. Activar animación visual
    this.efectoActivo.set(regalo.icon);

    // 2. Restar monedas localmente para feedback instantáneo
    this.misMonedas.update(m => m - regalo.precio);

    // 3. Aquí llamarías a tu API para descontar en DB (debes tener un endpoint POST para esto)
    console.log(`Regalo ${regalo.nombre} enviado`);

    // 4. Limpiar efecto después de 2 segundos
    setTimeout(() => {
      this.efectoActivo.set(null);
      this.regaloSeleccionado.set(null);
    }, 2000);
  }
}
