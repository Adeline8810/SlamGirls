import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ComentarioService {

  // Usamos tu URL de Render y el endpoint que definimos en el Controller
  private api = 'https://backend-ruth-slam.onrender.com/api/comentarios';
  private apiLikes = 'https://backend-ruth-slam.onrender.com/api/comentario-likes';

  constructor(private http: HttpClient) {}

  /**
   * Guarda un comentario nuevo o una respuesta
   * @param comentario Objeto con videoId, usuarioId, ownerId, contenido y opcionalmente parentId
   */
  guardarComentario(comentario: any): Observable<any> {
    return this.http.post<any>(`${this.api}/guardar`, comentario);
  }

  /**
   * Obtiene la lista de comentarios de un video específico
   * @param videoId ID del video
   */

  obtenerComentariosPorVideo(videoId: number, usuarioId: number): Observable<any[]> {
  // Le agregamos el ?usuarioLogueadoId= al final de la ruta
  return this.http.get<any[]>(`${this.api}/video/${videoId}?usuarioLogueadoId=${usuarioId}`);
}

  /**
   * Obtiene un comentario específico por su ID
   */
  getOne(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  /**
   * Elimina un comentario
   */
  eliminarComentario(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, { responseType: 'text' });
  }

  /**
   * Lógica para dar like a un comentario (opcional para el futuro)
   */

 toggleLike(comentarioId: number, usuarioId: number): Observable<string> {
    const params = new HttpParams()
      .set('comentarioId', comentarioId.toString())
      .set('usuarioId', usuarioId.toString());

    return this.http.post(`${this.apiLikes}/toggle`, {}, {
      params,
      responseType: 'text'
    });
  }


verificarLike(comentarioId: number, usuarioId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('comentarioId', comentarioId.toString())
      .set('usuarioId', usuarioId.toString());

    return this.http.get<boolean>(`${this.apiLikes}/estado`, { params });
  }



}
