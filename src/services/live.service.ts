import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LiveService {

  // Cambia esta URL por la de tu backend en Render
  private api = 'https://backend-ruth-slam.onrender.com//api/lives';

  constructor(private http: HttpClient) { }

  // 1. Obtener la lista de personas transmitiendo
  getLivesActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/activos`);
  }

  // 2. Crear un nuevo live (Inicia la transmisión en la DB)
// 1. Para empezar el live
iniciarLive(usuarioId: number, titulo: string): Observable<any> {
  return this.http.post<any>(`${this.api}/iniciar?usuarioId=${usuarioId}&titulo=${titulo}`, {});
}

// 2. Para terminar el live (usando el usuarioId como referencia)
finalizarLive(usuarioId: number): Observable<any> {
  // Nota: Si tu backend pide el ID del LIVE en lugar del usuario,
  // asegúrate de que el endpoint sea el correcto.
  return this.http.post<any>(`${this.api}/finalizar/por-usuario/${usuarioId}`, {});
}
}
