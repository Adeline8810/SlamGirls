import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TraduccionService {

  // 1. Definimos las URLs base correctamente
  private apiBase = 'https://backend-ruth-slam.onrender.com/api';

  // Estas son las que causaban error si no estaban bien declaradas:
  private apiUsuarios = 'https://backend-ruth-slam.onrender.com/api/usuarios';
  private apiRespuestas = 'https://backend-ruth-slam.onrender.com/api/respuestas';

  constructor(private http: HttpClient) { }

  // Método de traducción (Ya lo tienes bien, solo aseguro la URL)
  traducir(texto: string, target: string): Observable<string> {
    const body = { texto, target };
    return this.http.post<any>(`${this.apiRespuestas}/traducir`, body).pipe(
      map(res => res.traducido)
    );
  }

 // Paso 1: Busca personas (Va al UsuarioController)
 buscarUsuarios(nombre: string): Observable<any[]> {
  // encodeURIComponent limpia espacios y caracteres raros para la URL
  return this.http.get<any[]>(`${this.apiUsuarios}/buscar-usuarios?nombre=${encodeURIComponent(nombre)}`);
}

  // Paso 2: Busca el SLAM (Va al RespuestaController)
 buscarRespuestasPorAmigo(username: string): Observable<any[]> {
  // ✅ CAMBIO: Cambiamos 'nombre=' por 'username='
  // Esto debe coincidir exactamente con el @Param de tu Repository
  return this.http.get<any[]>(`${this.apiRespuestas}/buscar-por-nombre?username=${username}`);
}
}
