import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LiveService {

  // Cambia esta URL por la de tu backend en Render
  private api = 'https://tu-backend-en-render.com/api/lives';

  constructor(private http: HttpClient) { }

  // 1. Obtener la lista de personas transmitiendo
  getLivesActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/activos`);
  }

  // 2. Crear un nuevo live (Inicia la transmisión en la DB)
  iniciarLive(usuarioId: number, titulo: string): Observable<any> {
    // Usamos params porque en el Backend pusimos @RequestParam
    return this.http.post<any>(`${this.api}/iniciar?usuarioId=${usuarioId}&titulo=${titulo}`, {});
  }

  // 3. Finalizar el live
  finalizarLive(liveId: number): Observable<any> {
    return this.http.post<any>(`${this.api}/finalizar/${liveId}`, {});
  }
}
