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
  const idUsuario = Number(localStorage.getItem('usuarioId')); // Ejemplo
  const peticion = await this.audioService.detenerYEnviarAlServidor(idUsuario);

  peticion.subscribe({
    next: (res) => alert("¡Guardado en tu perfil!"),
    error: (err) => console.error(err)
  });
}
}
