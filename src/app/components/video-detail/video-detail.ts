import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecargarService } from '../../../services/recargar.service';
import confetti from 'canvas-confetti';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { StarmakerPlayer } from '../starmaker-player/starmaker-player';
import { StarmakerLyrics } from '../starmaker-lyrics/starmaker-lyrics';


@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [CommonModule,RouterModule,StarmakerPlayer, StarmakerLyrics],
  templateUrl: './video-detail.html',
  styleUrl: './video-detail.css'
})
export class VideoDetail   {

 // Recibimos el video desde el componente perfil
  @Input() video: any;
  @Input() canto: any; // Para la letra y otros datos



  @Output() cerrar = new EventEmitter<void>();

  // Variables para controlar lo que pasa en la pantalla
  tiempoActualDelVideo: number = 0;
  panelActivo: 'ninguno' | 'comentarios' | 'regalos' | 'compartir' = 'ninguno';

  constructor() {}

  // Lógica para cerrar el modal
  cerrarModal(event: any) {
    this.cerrar.emit();
  }

  // Funciones que llaman tus botones del Toolbar
  mostrarComentarios() {
    this.panelActivo = 'comentarios';
    console.log("Abriendo comentarios...");
  }

  mostrarRegalos() {
    this.panelActivo = 'regalos';
    console.log("Abriendo panel de regalos");
  }

  mostrarCompartir() {
    this.panelActivo = 'compartir';
    console.log("Abriendo opciones de compartir");
  }

  cerrarPaneles() {
    this.panelActivo = 'ninguno';
  }

  onVideoEnd() {
    console.log("El video ha terminado");
    // Aquí podrías poner lógica para repetir o sugerir otro
  }
}
