import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LivekitService } from '../../../services/livekit.service';
import { Room, RoomEvent, RemoteTrack, RemoteTrackPublication, RemoteParticipant } from 'livekit-client';

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

  async entrarALaClase() {
    try {
      // Pedir token a Spring Boot
      this.livekitService.getToken(this.roomName, this.userName).subscribe(async (res) => {

        // Conectar a LiveKit Cloud
        const room = await this.livekitService.joinRoom(res.token, this.modo === 'streamer');
        this.isJoined = true;

        // Escuchar cuando alguien publica su video (para el espectador)
        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
          if (track.kind === 'video' && this.videoElement) {
            track.attach(this.videoElement.nativeElement);
            this.conectado = true;
          }
        });
      });
    } catch (error) {
      console.error("Error al entrar:", error);
    }
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
