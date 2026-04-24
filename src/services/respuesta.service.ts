  import { Injectable,EventEmitter } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Respuesta } from '../models/respuesta';
  import { Observable } from 'rxjs';

  export interface Video {
  id: number;
  titulo: string;
  urlVideo: string;
  thumbnail?: string;
 }

  @Injectable({ providedIn: 'root' })
  export class RespuestaService {
    //private api = 'https://backend-ruth-slam.onrender.com/api/respuestas';
      private api = 'https://backend-ruth-slam.onrender.com/api/respuestas';

    constructor(private http: HttpClient) {}

   reiniciarSlam$ = new EventEmitter<void>();




   dispararReinicio() {
   this.reiniciarSlam$.emit();

  }




 subirFoto(file: File, usuarioId: string): Observable<string> {
  const formData = new FormData();
  // El nombre 'file' debe coincidir exactamente con @RequestParam("file") en Java
  formData.append('file', file);
  formData.append('usuarioId', usuarioId);

  return this.http.post('https://backend-ruth-slam.onrender.com/api/respuestas/upload', formData, {
    responseType: 'text' // Importante porque Java devuelve un String, no un JSON
  });
}

  actualizarRespuestas(respuestas: Respuesta[]): Observable<Respuesta[]> {
    return this.http.post<Respuesta[]>('https://backend-ruth-slam.onrender.com/api/respuestas/actualizar', respuestas);
  }

    obtenerRespuestasPorUsuario(usuarioId: number): Observable<Respuesta[]> {
      return this.http.get<Respuesta[]>(`${this.api}/usuario/${usuarioId}`);
    }


  // ESTE ES EL ÚNICO MÉTODO QUE NECESITAS PARA GUARDAR TODO
  guardarRespuestas(respuestas: Respuesta[]): Observable<Respuesta[]> {
    // Al enviar la lista a la raíz del API, el nuevo Java inteligente hará el resto
    return this.http.post<Respuesta[]>(this.api, respuestas);
  }


// 1. Para obtener los videos del usuario
obtenerVideos(usuarioId: number): Observable<Video[]> {
  // Ajustado a: /api/videos/usuario/{id} (como en tu Java)
  return this.http.get<Video[]>(`${this.api}/videos/usuario/${usuarioId}`);
}

// 2. Para subir un nuevo video
subirVideo(file: File, usuarioId: string): Observable<Video> {
  const formData = new FormData();
  formData.append('video', file);

  // Ajustado a: /api/videos/upload/{id} (como en tu Java)
  return this.http.post<Video>(`${this.api}/videos/upload/${usuarioId}`, formData);
}

  }
