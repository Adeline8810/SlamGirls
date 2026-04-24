  import { Injectable,EventEmitter } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Respuesta } from '../models/respuesta';
  import { Observable } from 'rxjs';

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


  // En tu RespuestaService
obtenerVideos(usuarioId: number): Observable<any[]> {
  // Ajusta la URL a tu endpoint de Node.js que consulta la tabla 'videos'
  return this.http.get<any[]>(`${this.api}/videos/${usuarioId}`);
}

subirVideo(file: File, usuarioId: string): Observable<any> {
  const formData = new FormData();
  formData.append('video', file);
  // Este endpoint en tu Backend debe hacer el INSERT en la tabla de Supabase
  return this.http.post(`${this.api}/subir-video/${usuarioId}`, formData);
}


  }
