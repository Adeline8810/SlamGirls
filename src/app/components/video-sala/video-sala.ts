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
  // 1. Usar un nombre único para evitar que LiveKit nos expulse por duplicados
  if (this.userName === 'Invitado') {
    this.userName = 'Invitado_' + Math.floor(Math.random() * 1000);
  }

  this.livekitService.getToken(this.roomName, this.userName).subscribe({
    next: async (res) => {
      try {
        const room = await this.livekitService.joinRoom(res.token, this.modo === 'streamer');
        this.isJoined = true;
        console.log("✅ Unido a la sala como:", this.modo);

        if (this.modo === 'streamer') {
          // Lógica Streamer: Usamos el ID del HTML
          const element = document.getElementById('miCamaraLocal') as HTMLVideoElement;

          room.localParticipant.on('trackPublished', (pub) => {
            if (pub.kind === 'video') {
              pub.track?.attach(element);
              this.conectado = true;
            }
          });

          // Fallback por si ya está publicado
          setTimeout(() => {
            const videoPub = Array.from(room.localParticipant.videoTrackPublications.values()).find(p => p.kind === 'video');
            if (videoPub?.track && element) {
              videoPub.track.attach(element);
              this.conectado = true;
            }
          }, 1500);
        }

        if (this.modo === 'viewer') {
          // Lógica Viewer: Esperamos un momento a que el *ngIf dibuje el video
          setTimeout(() => {
            // A. Revisar si la streamer ya está emitiendo
            room.remoteParticipants.forEach((participant) => {
              participant.trackPublications.forEach((pub) => {
                if (pub.kind === 'video' && pub.track && this.videoElement) {
                  pub.track.attach(this.videoElement.nativeElement);
                  this.conectado = true;
                  console.log("📺 Video de streamer encontrado");
                }
              });
            });

            // B. Escuchar si empieza después
            room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
              if (track.kind === Track.Kind.Video && this.videoElement) {
                track.attach(this.videoElement.nativeElement);
                this.conectado = true;
                console.log("📺 Nueva señal recibida");
              }
            });
          }, 1000);
        }

      } catch (err) {
        console.error("❌ Error en joinRoom:", err);
      }
    },
    error: (err) => console.error("❌ Error en Token:", err)
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
