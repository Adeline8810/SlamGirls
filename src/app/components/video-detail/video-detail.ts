import { Component, input, output, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecargarService } from '../../../services/recargar.service';
import confetti from 'canvas-confetti';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-detail.html',
  styleUrl: './video-detail.css'
})
export class VideoDetail implements OnInit {

  constructor(private router: Router) {}

  private recargarService = inject(RecargarService);

  video = input.required<any>();
  close = output<void>();

  misMonedas = signal<number>(0);
  regaloSeleccionado = signal<any>(null);
  efectoActivo = signal<string | null>(null);
  contadorRegalo = signal(0);
  timerRegalo: any;
  tabActual: 'gift' | 'comments' = 'gift';

  listaRegalos = [
    { id: 1, nombre: 'Rose', precio: 3, icon: 'assets/regalo1.png' },
    { id: 2, nombre: 'Microphone', precio: 9, icon: 'assets/regalo2.png' },
    { id: 3, nombre: 'Songful', precio: 18, icon: 'assets/regalo3.png' },
    { id: 4, nombre: 'Glow sticks', precio: 48, icon: 'assets/regalo4.png' },
    { id: 5, nombre: 'Music Box', precio: 60, icon: 'assets/regalo5.png' },
    { id: 6, nombre: 'Ferrari', precio: 3000, icon: 'assets/regalo6.png' },
    { id: 7, nombre: 'Pearl', precio: 200, icon: 'assets/regalo7.png' }
  ];

  ngOnInit() {
    this.obtenerMonedas();
  }

  obtenerMonedas() {
    const userJson = localStorage.getItem('usuario');
    if (userJson) {
      const user = JSON.parse(userJson);
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

  // --- NUEVO MÉTODO PARA EL EFECTO VISUAL ---
  private dispararEfectoEstrellas() {
    const duracion = 2 * 1000;
    const fin = Date.now() + duracion;

    const intervalo = setInterval(() => {
      if (Date.now() > fin) {
        return clearInterval(intervalo);
      }

      // Disparo desde la derecha (donde está el botón SEND)
      confetti({
        particleCount: 3,
        angle: 120, // Hacia la izquierda y arriba
        spread: 55,
        origin: { x: 0.9, y: 0.9 }, // Esquina inferior derecha
        colors: ['#FFE100', '#FFD700', '#FFFFFF'],
        shapes: ['star'],
        zIndex: 10000
      });

      // Disparo desde la izquierda para equilibrar
      confetti({
        particleCount: 3,
        angle: 60, // Hacia la derecha y arriba
        spread: 55,
        origin: { x: 0.1, y: 0.9 }, // Esquina inferior izquierda
        colors: ['#FFE100', '#FFD700', '#FFFFFF'],
        shapes: ['star'],
        zIndex: 10000
      });
    }, 100);
  }

  lanzarRegalo() {
    const regalo = this.regaloSeleccionado();
    if (!regalo || this.misMonedas() < regalo.precio) {
      alert("Monedas insuficientes");
      return;
    }

    // 1. Activar animación visual (Ícono grande)
    this.efectoActivo.set(regalo.icon);

    // 2. DISPARAR ESTRELLAS FUGACES 🌟
    this.dispararEfectoEstrellas();

    // 3. Restar monedas localmente
    this.misMonedas.update(m => m - regalo.precio);

    this.contadorRegalo.update(v => v + 1);

  // Reiniciar el contador si pasan 3 segundos sin enviar nada
  if (this.timerRegalo) clearTimeout(this.timerRegalo);
  this.timerRegalo = setTimeout(() => {
    this.contadorRegalo.set(0);
    this.efectoActivo.set(null);
  }, 3000);

  this.efectoActivo.set(regalo.icon);
  this.dispararEfectoEstrellas();

    // 4. API / DB
    console.log(`Regalo ${regalo.nombre} enviado`);

    // 5. Limpiar efectos
    setTimeout(() => {
      this.efectoActivo.set(null);
      this.regaloSeleccionado.set(null);
    }, 2000);
  }



  abrirPantallaRecarga() {
  // 3. Esto te lleva a la ruta que tengas configurada para el componente Recargar
  // Asegúrate de que en tu app.routes.ts la ruta sea 'recargar'
  this.router.navigate(['/recargar']);
}

}
