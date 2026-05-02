import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveService } from '../../../services/live.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-en-vivo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './en-vivo.html',
  styleUrls: ['./en-vivo.css']
})
export class EnVivo implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  private liveService = inject(LiveService);

  stream: MediaStream | null = null;
  usuarioId = localStorage.getItem('usuarioId') || '1'; // El ID de quien transmite

  ngOnInit() {
    this.iniciarCamara();
    this.avisarAlServidor(true); // Avisa que entraste en vivo
  }

  async iniciarCamara() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }
    } catch (err) {
      console.error("Error al acceder a la cámara: ", err);
      alert("No se pudo abrir la cámara.");
    }
  }

avisarAlServidor(estado: boolean) {
  const idNumerico = Number(this.usuarioId);
  const tituloLive = 'Mi Live en Directo';

  if (estado) {
    // LLAMADA PARA INICIAR
    this.liveService.iniciarLive(idNumerico, tituloLive).subscribe({
      next: (res) => {
        console.log('Live iniciado en BD correctamente', res);
        // Opcional: si el backend te da un ID de live, podrías guardarlo aquí
      },
      error: (err) => console.error('Error al iniciar Live en BD', err)
    });
  } else {
    // LLAMADA PARA FINALIZAR
    this.liveService.finalizarLive(idNumerico).subscribe({
      next: (res) => console.log('Live finalizado en BD', res),
      error: (err) => console.error('Error al finalizar Live en BD', err)
    });
  }
}
  ngOnDestroy() {
    // IMPORTANTE: Cuando sales de la página, apaga la cámara y avisa al servidor
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.avisarAlServidor(false); // Avisa que ya no estás en vivo
  }
}
