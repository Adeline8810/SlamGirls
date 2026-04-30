import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CancionService {

  // IMPORTANTE: Cambia esta URL por la de tu servidor real en Render o Localhost
  private API_URL = 'https://backend-ruth-slam.onrender.com/api/canciones';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las canciones para mostrarlas en el buscador
   */
  obtenerTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  /**
   * Obtiene una canción específica (para el Karaoke)
   */
  obtenerPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  /**
   * Sube una nueva canción a la nube (Cloudinary + Base de Datos)
   * Usamos FormData porque enviamos el archivo MP3 real
   */
  subirCancion(datos: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/subir`, datos);
  }

  /**
   * Eliminar canción (opcional)
   */
  eliminarCancion(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
