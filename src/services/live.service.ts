import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LiveService {

  // Cambia esta URL por la de tu backend en Render
  private api = 'https://backend-ruth-slam.onrender.com/api/lives';

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



// 2. Finalizar (Coincide con el nuevo método que pusimos arriba)
finalizarLive(usuarioId: number): Observable<any> {
  return this.http.post(`${this.api}/finalizar/usuario/${usuarioId}`, {}, { responseType: 'text' });
}

}
