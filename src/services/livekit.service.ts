import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Room } from 'livekit-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LivekitService {

  // URL de tu backend en Render
  private baseUrl = 'https://backend-ruth-slam.onrender.com/api/livekit';

  // URL REAL de tu proyecto LiveKit (sacada de tu imagen)
  private livekitUrl = 'wss://slam-z3pekaoc.livekit.cloud';

  private room: Room;

  constructor(private http: HttpClient) {
    this.room = new Room();
  }

  /**
   * 1. Pide el token de acceso al backend
   */
  getToken(roomName: string, participantName: string): Observable<{token: string}> {
    return this.http.get<{token: string}>(`${this.baseUrl}/token?room=${roomName}&identity=${participantName}`);
  }

  /**
   * 2. USUARIO 1: Crea el registro del Live en la DB (Spring Boot)
   */
  iniciarLiveEnDB(payload: { usuarioId: number, titulo: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/iniciar`, payload);
  }

  /**
   * 3. USUARIO 2: Obtiene los lives que están 'EN_VIVO'
   */
  getLivesActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos`);
  }

  /**
   * 4. FINALIZAR: Cambia estado a 'FINALIZADO' al terminar
   */
  finalizarLiveEnDB(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/finalizar/${id}`, {});
  }

  /**
   * 5. CONEXIÓN AL SERVIDOR DE VIDEO
   * @param token El token generado por Spring
   * @param esStreamer Si es true, activa cámara automáticamente
   */
  async joinRoom(token: string, esStreamer: boolean = false): Promise<Room> {
    try {
      // Usamos la URL real: wss://slam-z3pekaoc.livekit.cloud
      await this.room.connect(this.livekitUrl, token);
      console.log('✅ Conectado exitosamente a LiveKit Cloud');

      if (esStreamer) {
        await this.room.localParticipant.enableCameraAndMicrophone();
      }

      return this.room;
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      throw error;
    }
  }

  async leaveRoom() {
    if (this.room) {
      await this.room.disconnect();
    }
  }

  getRoom() {
    return this.room;
  }
}
