import Peer from 'peerjs'; // 1. Importamos PeerJS
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
  peer: Peer | null = null;
  usuarioId = localStorage.getItem('usuarioId') || '1'; // El ID de quien transmite

  ngOnInit() {
    this.iniciarCamara();
    this.avisarAlServidor(true); // Avisa que entraste en vivo
  }

  async iniciarCamara() {
  try {
     this.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
      });

      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }

      // 3. Una vez que tenemos la cámara, iniciamos PeerJS
      this.configurarPeer();

    } catch (err) {
      console.error("Error al acceder a la cámara: ", err);
      alert("No se pudo abrir la cámara.");
    }
  }

  configurarPeer() {
    // Creamos el Peer usando tu usuarioId como identificador único
    // Así los espectadores sabrán a quién "llamar"
    this.peer = new Peer(this.usuarioId);

    this.peer.on('open', (id) => {
      console.log('Mi ID de Peer es: ' + id);
      this.avisarAlServidor(true); // Ahora sí avisamos a la BD que estamos listos
    });

    // 4. ESCUCHAR LLAMADAS (Aquí es donde los fans se conectan)
    this.peer.on('call', (call) => {
      console.log('¡Alguien entró a ver el live!');

      // Respondemos la llamada enviando nuestro stream de video
      if (this.stream) {
        call.answer(this.stream);
      }
    });

    this.peer.on('error', (err) => {
      console.error('Error en PeerJS:', err);
    });
  }

avisarAlServidor(estado: boolean) {
    const idNumerico = Number(this.usuarioId);
    const tituloLive = 'Mi Live en Directo con PeerJS';

    if (estado) {
      this.liveService.iniciarLive(idNumerico, tituloLive).subscribe({
        next: (res) => console.log('Live iniciado en BD', res),
        error: (err) => console.error('Error al iniciar Live', err)
      });
    } else {
      this.liveService.finalizarLive(idNumerico).subscribe({
        next: (res) => console.log('Live finalizado en BD', res),
        error: (err) => console.error('Error al finalizar Live', err)
      });
    }
  }
ngOnDestroy() {
    // Limpieza total al salir
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    if (this.peer) {
      this.peer.destroy(); // Cerramos la conexión Peer
    }

    this.avisarAlServidor(false);
  }

}
