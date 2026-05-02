import { Component, OnInit, inject } from '@angular/core'; // 1. Importa 'inject'
import { LiveService } from '../../../services/live.service';
import { VideoService } from '../../../services/video.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit {
  listaLives: any[] = [];
  listaVideos: any[] = [];

  // 2. Inyecta los servicios directamente aquí (forma moderna)
  private liveService = inject(LiveService);
  private videoService = inject(VideoService);

  constructor() {} // El constructor queda vacío

  ngOnInit() {
    // 3. El resto del código funciona exactamente igual
    this.liveService.getLivesActivos().subscribe(data => this.listaLives = data);

    this.videoService.obtenerTodosLosVideos().subscribe(data => {
      this.listaVideos = data;
    });
  }
}
