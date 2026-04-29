import { Injectable } from '@angular/core';
import RecordRTC from 'recordrtc';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudioKaraokeService {

  constructor(private http: HttpClient) { }

  private mediaRecorder: any;
  public audioContext!: AudioContext; // Cambiado a public para que el componente lo limpie
  public stream!: MediaStream;
  private api = 'https://backend-ruth-slam.onrender.com/api/cantos';

  // ACTUALIZACIÓN: Este método ahora hace TODO (Efecto + Pista + Grabación)
  async iniciarGrabacionConPista(elementoAudio: HTMLAudioElement) {
    // 1. Micrófono
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext();

    // 2. Nodos de entrada
    const fuenteVoz = this.audioContext.createMediaStreamSource(this.stream);
    const fuentePista = this.audioContext.createMediaElementSource(elementoAudio);

    // 3. Efecto de REVERB (Eco suave para la voz)
    const delay = this.audioContext.createDelay();
    delay.delayTime.value = 0.1;
    const feedback = this.audioContext.createGain();
    feedback.gain.value = 0.3;

    // Conexión del eco (solo a la voz)
    fuenteVoz.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);

    // 4. Mezclador (Destino final de grabación)
    const destinoGrabacion = this.audioContext.createMediaStreamDestination();

    // Conectar Voz limpia + Voz con eco al grabador
    fuenteVoz.connect(destinoGrabacion);
    delay.connect(destinoGrabacion);

    // Conectar Pista musical al grabador
    fuentePista.connect(destinoGrabacion);

    // 5. Monitoreo (Para que escuches todo en tus audífonos)
    fuenteVoz.connect(this.audioContext.destination);
    delay.connect(this.audioContext.destination);
    fuentePista.connect(this.audioContext.destination);

    // 6. Iniciar RecordRTC con la mezcla
    this.mediaRecorder = new RecordRTC(destinoGrabacion.stream, {
      type: 'audio',
      mimeType: 'audio/wav',
      recorderType: RecordRTC.StereoAudioRecorder
    });

    this.mediaRecorder.startRecording();
    elementoAudio.play();
  }

  async detenerYEnviarAlServidor(usuarioId: number): Promise<Observable<any>> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.getState() === 'stopped') return;

      this.mediaRecorder.stopRecording(() => {
        const audioBlob = this.mediaRecorder.getBlob();
        const formData = new FormData();
        formData.append('archivo', audioBlob, 'grabacion.wav');
        formData.append('usuarioId', usuarioId.toString());
        resolve(this.http.post(`${this.api}/subir`, formData));
      });
    });
  }

  obtenerMisCantos(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/usuario/${usuarioId}`);
  }

  detenerFlujoAudio() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}
