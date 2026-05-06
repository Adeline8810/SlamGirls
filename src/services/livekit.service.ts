import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Room, RoomEvent, RemoteParticipant, RemoteTrack, RemoteTrackPublication } from 'livekit-client';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LivekitService {

  // Tu URL de Render
  private apiUrl = 'https://backend-ruth-slam.onrender.com/api/livekit/token';

  // URL de tu servidor LiveKit (el que corre en Docker o la nube)
  // Ejemplo: 'ws://localhost:7800' o 'wss://tu-servidor.livekit.cloud'
  private livekitUrl = 'wss://tu-proyecto-livekit.livekit.cloud';

  private room: Room;

  constructor(private http: HttpClient) {
    this.room = new Room();
  }

  /**
   * 1. Pide el token a tu Backend en Render
   */
  getToken(roomName: string, participantName: string): Observable<{token: string}> {
    return this.http.get<{token: string}>(`${this.apiUrl}?room=${roomName}&identity=${participantName}`);
  }

  /**
   * 2. Conecta a la sala de video usando el token obtenido
   */
  async joinRoom(token: string): Promise<Room> {
    try {
      await this.room.connect(this.livekitUrl, token);
      console.log('Conectado a la sala:', this.room.name);

      // Publicar automáticamente mi cámara y micrófono
      await this.room.localParticipant.enableCameraAndMicrophone();

      return this.room;
    } catch (error) {
      console.error('Error al conectar con LiveKit:', error);
      throw error;
    }
  }

  /**
   * 3. Salir de la sala y limpiar recursos
   */
  async leaveRoom() {
    if (this.room) {
      await this.room.disconnect();
    }
  }

  /**
   * Acceso a la instancia de la sala para escuchar eventos (quién entra, quién sale)
   */
  getRoom() {
    return this.room;
  }
}
