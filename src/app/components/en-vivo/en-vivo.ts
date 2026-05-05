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
  // 1. Configuración con servidores de Google para atravesar redes móviles/firewalls
this.peer = new Peer(String(this.usuarioId), {
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

  // 2. Evento cuando Adeline se conecta con éxito al servidor de PeerJS
  this.peer.on('open', (id) => {
    console.log('✅ Mi ID de Peer está activo: ' + id);
    this.avisarAlServidor(true);
  });

  // 3. Evento cuando UN ESPECTADOR (Ruth) llama para ver el video
  this.peer.on('call', (call) => {
    console.log('📞 ¡Recibiendo petición de video de un espectador!');

    // Función interna para contestar
    const intentarContestar = () => {
      if (this.stream && this.stream.active) {
        call.answer(this.stream);
        console.log('✅ Respuesta enviada con éxito. El espectador debería ver el video ahora.');
      } else {
        console.error('❌ No hay stream activo para enviar. ¿Diste permisos a la cámara?');
      }
    };

    // LÓGICA DE REINTENTO:
    // Si la cámara aún no está lista (this.stream es null), esperamos 2 segundos
    if (!this.stream) {
      console.warn('⚠️ La cámara aún no está lista. Reintentando contestar en 2 segundos adelineeee...');
      setTimeout(() => {
        intentarContestar();
      }, 2000);
    } else {
      intentarContestar();
    }
  });

  // 4. Manejo de errores para saber si el ID ya está ocupado
  this.peer.on('error', (err) => {
    console.error('❌ Error en el sistema Peer ayy ruthhhh:', err.type);
    if (err.type === 'unavailable-id') {
      console.error('El ID ya está en uso. Asegúrate de no tener dos pestañas abiertas con el mismo usuario.');
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
