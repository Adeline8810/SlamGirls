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

if (this.modo === 'streamer') {
    // Escuchamos el evento de cuando el track local esté listo para usarse
    room.localParticipant.on('trackPublished', (publication) => {
        if (publication.kind === 'video') {
            const track = publication.track;
            const element = document.getElementById('miCamaraLocal') as HTMLVideoElement;

            if (track && element) {
                console.log("🚀 Pegando video al elemento ID: miCamaraLocal");
                track.attach(element);
                this.conectado = true;
            }
        }
    });

    // Por si ya se publicó antes de que el código llegara aquí
    setTimeout(() => {
        const videoPub = Array.from(room.localParticipant.videoTrackPublications.values()).find(p => p.kind === 'video');
        const element = document.getElementById('miCamaraLocal') as HTMLVideoElement;

        if (videoPub?.track && element) {
            console.log("🚀 Pegando video (Fallback)");
            videoPub.track.attach(element);
            this.conectado = true;
        }
    }, 2000);
}

        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
          if (track.kind === Track.Kind.Video && this.videoElement) {
            track.attach(this.videoElement.nativeElement);
            this.conectado = true;
          }
        });
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
