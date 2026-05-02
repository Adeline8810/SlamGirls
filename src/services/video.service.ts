import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  // Ajusta estas URLs a tu dominio de Render
  private API_VIDEOS = 'https://tu-backend-adeline.onrender.com/api/videos';
  private API_CANTOS = 'https://tu-backend-adeline.onrender.com/api/cantos';

  constructor(private http: HttpClient) { }

  // REEMPLAZO 1: Obtener todos los videos (VideoController)
  obtenerTodosLosVideos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_VIDEOS}/todos`);
  }

  // REEMPLAZO 2: Obtener todos los cantos/covers (CantoController)
  obtenerTodosLosCovers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_CANTOS}/todos`);
  }

  /**
   * OPCIONAL: Si luego quieres filtrar por categoría
   */
  obtenerPorCategoria(categoria: string): Observable<any[]> {
    // Puedes elegir si buscar en videos o cantos
    return this.http.get<any[]>(`${this.API_VIDEOS}/categoria/${categoria}`);
  }
}
