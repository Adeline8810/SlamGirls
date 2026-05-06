import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LivekitService } from '../../../services/livekit.service';
import { Room, RoomEvent, RemoteTrack, Track } from 'livekit-client';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-sala',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './video-sala.html',
  styleUrls: ['./video-sala.css']
})
export class VideoSalaComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('remoteVideo') videoElement!: ElementRef<HTMLVideoElement>;

  roomName: string = '';
  userName: string = '';
  modo: string = '';
  isJoined: boolean = false;
  conectado: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private livekitService: LivekitService
  ) {}

  ngOnInit() {
    this.roomName = this.route.snapshot.queryParamMap.get('sala') || '';
    // Forzamos nombre único siempre para evitar expulsiones
    const randomId = Math.floor(Math.random() * 1000);
    const userBase = this.route.snapshot.queryParamMap.get('usuario') || 'Invitado';
    this.userName = `${userBase}_${randomId}`;
    this.modo = this.route.snapshot.queryParamMap.get('modo') || 'viewer';
  }

  // ESTO ES CLAVE: Esperamos a que la vista esté lista
  async ngAfterViewInit() {
    if (this.roomName) {
      await this.entrarALaClase();
    }
  }

  async entrarALaClase() {
    this.livekitService.getToken(this.roomName, this.userName).subscribe({
      next: async (res) => {
        try {
          const room = await this.livekitService.joinRoom(res.token, this.modo === 'streamer');
          this.isJoined = true;
          console.log("✅ Conectado como:", this.modo);

          if (this.modo === 'streamer') {
            // Buscamos el elemento local por ID
            const element = document.getElementById('miCamaraLocal') as HTMLVideoElement;

            // Escuchamos cuando nuestra propia cámara esté lista
            room.localParticipant.on('trackPublished', (pub) => {
              if (pub.kind === 'video' && pub.track && element) {
                pub.track.attach(element);
                this.conectado = true;
                console.log("🎥 Streamer: Video local vinculado");
              }
            });

            // Pequeño delay de seguridad para el elemento local
            setTimeout(() => {
              const localTrack = Array.from(room.localParticipant.videoTrackPublications.values())
                .find(p => p.kind === 'video')?.videoTrack;
              if (localTrack && element) {
                localTrack.attach(element);
                this.conectado = true;
              }
            }, 1000);
          }

          if (this.modo === 'viewer') {
            // 1. Ver si la streamer ya está emitiendo
            room.remoteParticipants.forEach((p) => {
              p.trackPublications.forEach((pub) => {
                if (pub.kind === 'video' && pub.videoTrack && this.videoElement) {
                  pub.videoTrack.attach(this.videoElement.nativeElement);
                  this.conectado = true;
                }
              });
            });

            // 2. Escuchar nuevas señales
            room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
              if (track.kind === Track.Kind.Video && this.videoElement) {
                track.attach(this.videoElement.nativeElement);
                this.conectado = true;
                console.log("📺 Viewer: Video remoto recibido");
              }
            });
          }
        } catch (err) {
          console.error("❌ Error al unirse:", err);
        }
      },
      error: (err) => console.error("❌ Error de token:", err)
    });
  }

  async salir() {
    await this.livekitService.leaveRoom();
    this.router.navigate(['/inicio']);
  }

  ngOnDestroy() {
    this.livekitService.leaveRoom();
  }
}
