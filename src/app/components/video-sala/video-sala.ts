import { Component, ElementRef, ViewChild } from '@angular/core';
// Cambiamos CommonFormsModule por CommonModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Verifica que el archivo se llame exactamente video.service.ts
import { LivekitService } from '../../../services/livekit.service';
import { Track } from 'livekit-client';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-video-sala',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './video-sala.html',
  styleUrl: './video-sala.css'
})
export class VideoSalaComponent {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;

  roomName: string = '';
  userName: string = '';
  isJoined: boolean = false;

 constructor(
  private route: ActivatedRoute,
  private livekitService: LivekitService
) {}

async ngOnInit() {
  // Capturamos los datos de la URL automáticamente
  const sala = this.route.snapshot.queryParamMap.get('sala');
  const user = this.route.snapshot.queryParamMap.get('usuario');

  if (sala && user) {
    this.roomName = sala;
    this.userName = user;

    // Ejecutamos la conexión sin que el usuario toque nada
    await this.entrarALaClase();
  }
}

  async entrarALaClase() {
    if (!this.roomName || !this.userName) return alert('Pon tu nombre y sala');

    // 1. Pedimos el token al backend de Render
    this.livekitService.getToken(this.roomName, this.userName).subscribe(async (res) => {

      // 2. Nos conectamos a la sala
      const room = await this.livekitService.joinRoom(res.token);
      this.isJoined = true;

      // 3. Mostramos TU cámara en pantalla
      room.localParticipant.on('trackSubscribed', (track) => {
        if (track.kind === Track.Kind.Video) {
          track.attach(this.localVideo.nativeElement);
        }
      });

      // Forzar mostrar mi propia cámara de inmediato
     const videoTrackPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);

      if (videoTrackPublication && videoTrackPublication.videoTrack) {
          // Adjuntamos el track de video al elemento HTML
          videoTrackPublication.videoTrack.attach(this.localVideo.nativeElement);
      }
    });
  }
}
