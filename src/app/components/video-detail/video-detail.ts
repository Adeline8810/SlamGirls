import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-detail.html',
  styleUrl: './video-detail.css'
})
export class VideoDetail {
  // En Angular 20 usamos signals para las entradas (inputs)
  video = input.required<any>();

  // Evento para cerrar el detalle
  close = output<void>();

  darRegalo() {
    console.log('Enviando regalo para el video:', this.video().id);
    // Aquí iría tu lógica con el RespuestaService
  }

  compartir() {
    console.log('Compartiendo:', this.video().urlVideo);
  }

  cerrar() {
    this.close.emit();
  }
}
