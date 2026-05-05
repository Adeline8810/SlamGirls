import Peer from 'peerjs'; // 1. Importamos PeerJS
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveService } from '../../../services/live.service'; // Ajusta la ruta si es necesario
import { Router } from '@angular/router'; //

@Component({
  selector: 'app-en-vivo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './en-vivo.html',
  styleUrls: ['./en-vivo.css']
})
export class EnVivo implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  private router = inject(Router); // 2. Inyecta el router

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
  this.peer = new Peer(String(this.usuarioId));

  this.peer.on('open', (id) => {
    console.log('Mi ID de Peer es: ' + id);
    this.avisarAlServidor(true);
  });

  // ESTA ES LA PARTE QUE DEBE ESTAR SÍ O SÍ:
  this.peer.on('call', (call) => {
    console.log('¡Recibiendo llamada de un espectador!');

    // El emisor RESPONDE enviando su stream de cámara
    if (this.stream) {
      call.answer(this.stream);
      console.log('Respuesta enviada con éxito');
    } else {
      console.error('No hay stream de cámara para enviar');
    }
  });
}

avisarAlServidor(estado: boolean) {
  const idNumerico = Number(this.usuarioId);
  const tituloLive = 'Mi Live en Directo';

  this.liveService.iniciarLive(idNumerico, tituloLive).subscribe({
    next: (res) => {
      console.log('Live iniciado en BD', res);
      // Aquí podrías activar una variable "showButton = true"
    },
    error: (err) => {
      console.error('Error al iniciar Live', err);
      // AUNQUE falle el servidor, mostramos el botón para que puedas salir
      alert("Error de servidor, pero la cámara seguirá activa localmente.");
    }
  });
}

ngOnDestroy() {
    this.detenerTodo();
  }


// 3. Crea esta función específica para el botón
  finalizarDirecto() {
    if (confirm("¿Estás segura de que quieres finalizar el directo?")) {
      this.detenerTodo();
      this.router.navigate(['/inicio']); // Te saca de ahí automáticamente
    }
  }

  private detenerTodo() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.avisarAlServidor(false);
  }


}
