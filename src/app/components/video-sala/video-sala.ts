import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router,RouterModule } from '@angular/router';
import { LivekitService } from '../../../services/livekit.service';
import { Room, RoomEvent, RemoteTrack, RemoteTrackPublication, RemoteParticipant,Track } from 'livekit-client';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-video-sala',
  standalone: true, // Asegúrate de que diga true si es standalone
  imports: [CommonModule, RouterModule], // <--- 2. Agrégalo aquí
  templateUrl: './video-sala.html',
  styleUrls: ['./video-sala.css']
})
export class VideoSalaComponent implements OnInit, OnDestroy {
  @ViewChild('remoteVideo') videoElement!: ElementRef<HTMLVideoElement>;

  roomName: string = '';
  userName: string = '';
  modo: string = ''; // 'streamer' o 'viewer'
  isJoined: boolean = false;
  conectado: boolean = false;
  liveIdEnDB: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private livekitService: LivekitService
  ) {}

  async ngOnInit() {
    // 1. Capturar datos de la URL automáticamente
    this.roomName = this.route.snapshot.queryParamMap.get('sala') || '';
    this.userName = this.route.snapshot.queryParamMap.get('usuario') || 'Invitado';
    this.modo = this.route.snapshot.queryParamMap.get('modo') || 'viewer';

    // 2. Si tenemos sala, conectamos de inmediato
    if (this.roomName) {
      await this.entrarALaClase();
    }
  }
@ViewChild('localVideo') localVideoElement!: ElementRef<HTMLVideoElement>;

 async entrarALaClase() {
  this.livekitService.getToken(this.roomName, this.userName).subscribe({
    next: async (res) => {
      try {
        const room = await this.livekitService.joinRoom(res.token, this.modo === 'streamer');
        this.isJoined = true;

        // --- LÓGICA PARA EL STREAMER ---
        if (this.modo === 'streamer') {
          room.localParticipant.on('trackPublished', (publication) => {
            if (publication.kind === 'video') {
              const element = document.getElementById('miCamaraLocal') as HTMLVideoElement;
              publication.track?.attach(element);
              this.conectado = true;
            }
          });

          // Fallback para el streamer
          setTimeout(() => {
            const videoPub = Array.from(room.localParticipant.videoTrackPublications.values()).find(p => p.kind === 'video');
            const element = document.getElementById('miCamaraLocal') as HTMLVideoElement;
            if (videoPub?.track && element) {
              videoPub.track.attach(element);
              this.conectado = true;
            }
          }, 2000);
        }

        // --- LÓGICA PARA EL VIEWER (ESPECTADOR) ---
        if (this.modo === 'viewer') {
          // 1. REVISAR SI YA HAY ALGUIEN TRANSMITIENDO (Para los que entran tarde)
          room.remoteParticipants.forEach((participant) => {
            participant.trackPublications.forEach((publication) => {
              if (publication.kind === 'video' && publication.track) {
                // Usamos nativeElement porque aquí usas @ViewChild('remoteVideo')
                publication.track.attach(this.videoElement.nativeElement);
                this.conectado = true;
                console.log("📺 Video remoto recuperado al entrar");
              }
            });
          });

          // 2. ESCUCHAR NUEVAS TRANSMISIONES (Tu código original)
          if (this.modo === 'viewer') {
          room.remoteParticipants.forEach((participant) => {
            participant.trackPublications.forEach((publication) => {
              if (publication.track && publication.kind === 'video') {
                // Si ya hay video, lo pegamos de una vez
                publication.track.attach(this.videoElement.nativeElement);
                this.conectado = true; // Esto quita el mensaje "Esperando señal"
                console.log("📺 Video recuperado: Ya estaba emitiendo");
              }
            });
          });
        }
          room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
            if (track.kind === Track.Kind.Video && this.videoElement) {
              track.attach(this.videoElement.nativeElement);
              this.conectado = true;
              console.log("📺 Nueva señal de video recibida");
            }
          });
        }

      } catch (err) {
        console.error("Error al conectar a la sala:", err);
      }
    },
    error: (err) => console.error("Error al obtener el token:", err)
  });
}

  async salir() {
    await this.livekitService.leaveRoom();
    this.isJoined = false;
    this.conectado = false;
    this.router.navigate(['/inicio']);
  }

  ngOnDestroy() {
    this.livekitService.leaveRoom();
  }
}
