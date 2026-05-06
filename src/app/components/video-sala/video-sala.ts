import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LivekitService } from '../../../services/livekit.service';
import { Room, RoomEvent, RemoteTrack, RemoteTrackPublication, RemoteParticipant,Track } from 'livekit-client';



@Component({
  selector: 'app-video-sala',
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
    // 1. Esperamos un segundo para asegurar que LiveKit encendió la cámara
    setTimeout(() => {
        const localP = room.localParticipant;
        // Buscamos específicamente el track de video
        const videoPub = Array.from(localP.videoTrackPublications.values())
                              .find(p => p.kind === 'video');

        const localVideoTrack = videoPub?.videoTrack;

        if (localVideoTrack && this.localVideoElement) {
            console.log("🎥 Intentando pegar cámara al HTML...");
            localVideoTrack.attach(this.localVideoElement.nativeElement);
            this.conectado = true;
        } else {
            console.error("❌ No se encontró el track de video local tras esperar.");
        }
    }, 1500); // 1.5 segundos de espera
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
