import { Component } from '@angular/core';
import { AudioKaraokeService } from '../../../services/audio-karaoke.service';

@Component({
  selector: 'app-cantar',
  templateUrl: './cantar.html',
  styleUrls: ['./cantar.css']
})
export class Cantar {
  grabando: boolean = false;
  letraActual: string = 'Presiona comenzar para iniciar...';
  letraSiguiente: string = '';

  constructor(private audioService: AudioKaraokeService) {}

  // 1. Iniciar la magia
  async iniciar() {
    this.grabando = true;
    await this.audioService.iniciarGrabacionConEfecto();
  }

  // 2. Finalizar y subir (El método que limpia todo)
  async finalizarCanto() {
    this.grabando = false;

    // Pedimos al servicio que detenga todo y nos de el "disparador" (Observable)
    const peticionSubida = await this.audioService.detenerYEnviarAlServidor();

    // Nos suscribimos para saber cuando termine de subir a Cloudinary
    peticionSubida.subscribe({
      next: (res) => {
        console.log("¡Canción en la nube!", res.url);
        alert("¡Tu interpretación ha sido guardada con éxito!");
        // Aquí podrías redirigir al perfil o limpiar la pantalla
      },
      error: (err) => {
        console.error("Error al subir:", err);
        alert("Se grabó pero hubo un problema al subirlo al servidor.");
      }
    });
  }
}
