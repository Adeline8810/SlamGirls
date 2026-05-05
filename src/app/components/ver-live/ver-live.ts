import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import Peer from 'peerjs'; // 1. Importamos PeerJS
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-ver-live',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ver-live.html', // <--- Cambia 'template' por 'templateUrl'
  styleUrls: ['./ver-live.css']    // <--- Lo mismo con los estilos
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
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
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

  // Ruth inicia la llamada enviando un stream vacío
const streamVacio = new MediaStream();
const call = this.peer.call(this.userId!, streamVacio);

  if (call) {
    console.log('ENTRA AL IF CALL');
    // ESTO ES LO QUE FALTA: Ruth debe estar lista para recibir
    call.on('stream', (remoteStream) => {
  this.conectado = true; // Esto quita el fondo negro de carga
  console.log('DESPUES DE this.conectado = true');
  const video = this.remoteVideo.nativeElement;
console.log('DESPUES  const video = this.remoteVideo.nativeElement;');
  // ESTA ES LA LÍNEA QUE MUESTRA EL VIDEO. Si usas .src no funciona.
  video.srcObject = remoteStream;
console.log('DESPUES DE  video.srcObject = remoteStream;');
  // Forzamos al navegador a mostrarlo
  video.play();
  console.log('DESPUES DE  video.play();');
});

    call.on('error', (err) => {
      console.error('Error en la conexión:', err);
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
