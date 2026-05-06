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
        this.isJoined = true; // Aquí se activa el *ngIf del video
        console.log("✅ Conectado a la sala");

        // --- LÓGICA PARA EL STREAMER ---
        if (this.modo === 'streamer') {
          const element = document.getElementById('miCamaraLocal') as HTMLVideoElement;
          room.localParticipant.on('trackPublished', (pub) => {
            if (pub.kind === 'video' && pub.track) {
              pub.track.attach(element);
              this.conectado = true;
            }
          });
          // Fallback streamer
          setTimeout(() => {
            const videoPub = Array.from(room.localParticipant.videoTrackPublications.values()).find(p => p.kind === 'video');
            if (videoPub?.track && element) {
              videoPub.track.attach(element);
              this.conectado = true;
            }
          }, 1000);
        }

        // --- LÓGICA PARA EL VIEWER (ESPECTADOR) ---
        if (this.modo === 'viewer') {
          // 1. ESPERAMOS A QUE EL *ngIf DIBUJE EL VIDEO EN EL HTML
          setTimeout(() => {
            if (!this.videoElement) {
              console.error("❌ Error: No se encontró #remoteVideo. ¿Está el *ngIf funcionando?");
              return;
            }

            // A. Revisar si la streamer ya está transmitiendo
            room.remoteParticipants.forEach((participant) => {
              participant.trackPublications.forEach((publication) => {
                if (publication.kind === 'video' && publication.track) {
                  publication.track.attach(this.videoElement.nativeElement);
                  this.conectado = true; // Quita el mensaje de espera
                  console.log("📺 Video detectado al entrar");
                }
              });
            });

            // B. Escuchar si empieza a transmitir después
            room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
              if (track.kind === Track.Kind.Video) {
                track.attach(this.videoElement.nativeElement);
                this.conectado = true;
                console.log("📺 Nueva señal recibida");
              }
            });
          }, 500); // 500ms es suficiente para que Angular renderice el *ngIf
        }

      } catch (err) {
        console.error("❌ Error al entrar:", err);
      }
    },
    error: (err) => console.error("❌ Error token:", err)
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
