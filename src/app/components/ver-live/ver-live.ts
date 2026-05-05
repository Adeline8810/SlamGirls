import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import Peer from 'peerjs'; // 1. Importamos PeerJS

@Component({
  selector: 'app-ver-live',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="viewer-container">
      <div class="live-header">
        <span class="badge">EN VIVO</span>
        <p>Viendo a: Usuario {{ userId }}</p>
      </div>

      <!-- 2. Agregamos el elemento de video real -->
      <div class="video-container">
        <video #remoteVideo autoplay playsinline class="video-player"></video>

        <!-- Mensaje de espera mientras conecta -->
        <div *ngIf="!conectado" class="loading-overlay">
          <p>Conectando con la señal de video...</p>
        </div>
      </div>

      <button class="btn-exit" routerLink="/">SALIR</button>
    </div>
  `,
  styles: [`
    .viewer-container { height: 100vh; background: #000; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
    .badge { background: red; padding: 5px 10px; border-radius: 5px; font-weight: bold; margin-bottom: 10px; }
    .video-container { width: 100%; height: 70%; position: relative; display: flex; justify-content: center; }
    .video-player { width: 100%; height: 100%; object-fit: cover; background: #222; }
    .loading-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); }
    .btn-exit { margin-top: 20px; background: #333; color: white; border: none; padding: 10px 30px; border-radius: 20px; cursor: pointer; }
  `]
})
export class VerLive implements OnInit, OnDestroy {
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  private route = inject(ActivatedRoute);

  userId: string | null = '';
  peer: Peer | null = null;
  conectado: boolean = false;

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
   console.log("Estoy en la página de Ruth. Voy a buscar el video de ADELINE que es el ID: " + this.userId);

    if (this.userId) {
      this.iniciarConexion();
    }
  }

  iniciarConexion() {
    // 3. El espectador no necesita un ID fijo, PeerJS le dará uno aleatorio
    this.peer = new Peer();

    this.peer.on('open', (id) => {
      console.log('Mi ID de espectador es: ' + id);
      this.llamarAlEmisor();
    });
  }

  llamarAlEmisor() {
  if (!this.peer || !this.userId) return;

  console.log('Llamando a Adeline (ID: ' + this.userId + ')...');

  const call = this.peer.call(this.userId, new MediaStream());
  console.log('call '  , call);
  if (call) {
    console.log('Llamada creada. Esperando que Adeline acepte...');
  }

  call.on('stream', (remoteStream) => {
    // Usamos la función de apoyo que ya tienes escrita abajo
    this.procesarStreamEntrante(remoteStream);
  });

  call.on('error', (err) => {
    console.error('Error al intentar conectar:', err);
    this.conectado = false;
  });
}

// Separamos la lógica del video para que el código sea más legible
private procesarStreamEntrante(remoteStream: MediaStream) {
  console.error('remoteStream:', remoteStream) ;
  console.log('¡Señal de video recibida!');
  this.conectado = true;

  if (this.remoteVideo) {
    const video = this.remoteVideo.nativeElement;
    video.srcObject = remoteStream;

    // Obligatorio para móviles: silenciar para que el navegador permita el inicio automático
    video.muted = true;
    video.play().catch(e => console.error("Error al reproducir automáticamente:", e));
  }
}

  ngOnDestroy() {
    // 5. Cerramos la conexión al salir
    if (this.peer) {
      this.peer.destroy();
    }
  }
}
