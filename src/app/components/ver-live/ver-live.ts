import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import Peer from 'peerjs'; // 1. Importamos PeerJS
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-ver-live',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="viewer-container">
    <div class="live-header" style="display: flex; align-items: center; gap: 10px; padding: 10px;">
      <!-- USAMOS TUS CAMPOS fotoUrl o fotoPortada -->
      <img [src]="usuario?.fotoUrl || usuario?.fotoPortada || 'assets/img/default-user.png'"
           style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid red;">

      <div>
        <span class="badge">EN VIVO</span>
        <p style="margin: 0;">Viendo a: {{ usuario?.username || userId }}</p>
      </div>
    </div>

    <div class="video-container">
      <!-- Agregamos muted para asegurar que el navegador lo reproduzca -->
      <video #remoteVideo autoplay playsinline [muted]="true" class="video-player"></video>

      <div *ngIf="!conectado" class="loading-overlay">
        <p>Conectando con la señal de video de {{ usuario?.username }}...</p>
      </div>
    </div>

    <button class="btn-exit" routerLink="/">SALIR</button>
  </div>
`
  ,
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
  usuario: any;
  peer: Peer | null = null;
  conectado: boolean = false;
  private usuarioService = inject(UsuarioService);

ngOnInit() {
  const idDesdeUrl = this.route.snapshot.paramMap.get('id');

  if (idDesdeUrl) {
    this.userId = idDesdeUrl; // Guardamos el 27

    // USAMOS TU MÉTODO getOne para traer a Adeline
    this.usuarioService.getOne(Number(this.userId)).subscribe({
      next: (datosAdeline) => {
        this.usuario = datosAdeline;
        console.log('✅ Adeline cargada:', this.usuario.username);

        // RECIÉN AQUÍ iniciamos el video, ahora que sabemos que el ID es real
        this.iniciarConexion();
      },
      error: (err) => {
        console.error('❌ Error: No se encontró al usuario con ID ' + this.userId, err);
      }
    });
  }
}


iniciarConexion() {
  // Ruth no lleva ID en el primer paréntesis, pero SI lleva la configuración
  this.peer = new Peer({
    config: {
      'iceServers': [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }
  });

  this.peer.on('open', (id) => {
    console.log('Mi ID de espectador es: ' + id);
    this.llamarAlEmisor();
  });
}
llamarAlEmisor() {
  if (!this.peer || !this.userId) return;

  console.log('Llamando a Adeline (ID: ' + this.userId + ')...');

  // 1. Iniciamos la llamada (enviamos un stream vacío porque solo queremos recibir)
  const call = this.peer.call(this.userId, new MediaStream());

  if (call) {
    console.log('Llamada creada. Esperando que Adeline acepte...');

    // 2. ESCUCHAMOS cuando Adeline nos envíe su video
    call.on('stream', (remoteStream) => {
      console.log('¡Señal de video recibida correctamente!');
      // Usamos el método que ya tienes definido abajo
      this.procesarStreamEntrante(remoteStream);
    });

    call.on('error', (err) => {
      console.error('Error en la llamada:', err);
      this.conectado = false;
    });
  }
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
