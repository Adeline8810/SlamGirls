import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import Peer from 'peerjs'; // 1. Importamos PeerJS
import { UsuarioService } from '../../../services/usuario.service';
import { ChangeDetectorRef } from '@angular/core';

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

   constructor(private cdr: ChangeDetectorRef) { }

ngOnInit() {
  // 1. Capturamos el ID de la URL (ej: /ver-live/18)
  const idDesdeUrl = this.route.snapshot.paramMap.get('id');

  if (idDesdeUrl) {
    this.userId = idDesdeUrl; // <-- Aquí guardamos el "18"
    console.log('Llamaremos al ID:', this.userId);

    // 2. AHORA SÍ iniciamos PeerJS
    this.iniciarConexion();

    // 3. Traemos la foto (opcional)
    this.usuarioService.getOne(Number(this.userId)).subscribe({
      next: (u) => this.usuario = u
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

  const ejecutarLlamada = () => {
    console.log('Intentando conectar con Adeline (ID: 18)...');
    const call = this.peer!.call(this.userId!, new MediaStream());

    call.on('stream', (remoteStream) => {
      alert('¡EL VIDEO YA LLEGÓ A RUTH!');
  console.log('¡RECIBIENDO STREAM EN RUTH!');
  this.conectado = true;

  const video = this.remoteVideo.nativeElement;
  video.srcObject = remoteStream;

  this.cdr.detectChanges(); // <--- ESTO obliga a Angular a quitar el círculo y mostrar el video
  video.play();

});

    // Si después de 5 segundos no hay respuesta, Ruth vuelve a intentar solita
    setTimeout(() => {
      if (!this.conectado) {
        console.warn('Reintentando llamada...');
        ejecutarLlamada();
      }
    }, 5000);
  };

  ejecutarLlamada();
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
