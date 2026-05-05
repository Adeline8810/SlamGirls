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
    this.userId = idDesdeUrl;

    // 1. ARRANCAMOS EL VIDEO PRIMERO
    this.iniciarConexion();

    // 2. LUEGO INTENTAMOS CARGAR LA FOTO (si falla no importa)
    this.usuarioService.getOne(Number(this.userId)).subscribe({
      next: (datos) => { this.usuario = datos; },
      error: (err) => { console.error('Error de API, pero el video sigue...'); }
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
  // 1. Si no hay peer o id, nos salimos para evitar errores
  if (!this.peer || !this.userId) return;

  // 2. Usamos el ! para quitar el error rojo de TypeScript
  const call = this.peer!.call(this.userId!, new MediaStream());

  if (call) {
    call.on('stream', (remoteStream) => {
      console.log('¡STREAM RECIBIDO!');
      this.conectado = true; // Quita el mensaje de "Sincronizando..."

      // ASIGNACIÓN AL VIDEO
      const video = this.remoteVideo.nativeElement;
      video.srcObject = remoteStream;

      // Muted es OBLIGATORIO
      video.muted = true;
      video.play().catch(e => console.error("Error en play:", e));
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
