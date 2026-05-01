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
  // Actualizamos la firma del método para recibir modo y stream de cámara
async iniciarGrabacionConPista(
  elementoAudio: HTMLAudioElement,
  modo: string = 'audio',
  streamCamara: MediaStream | null = null
) {
  // 1. Micrófono (Mantenemos tu lógica)
  this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  this.audioContext = new AudioContext();

  // 2. Nodos de entrada (Mantenemos tus nombres de variables)
  const fuenteVoz = this.audioContext.createMediaStreamSource(this.stream);
  const fuentePista = this.audioContext.createMediaElementSource(elementoAudio);

  // 3. Efecto de REVERB (Mantenemos tu configuración de eco)
  const delay = this.audioContext.createDelay();
  delay.delayTime.value = 0.1;
  const feedback = this.audioContext.createGain();
  feedback.gain.value = 0.3;

  fuenteVoz.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);

  // 4. Mezclador (Destino final de grabación)
  const destinoGrabacion = this.audioContext.createMediaStreamDestination();

  fuenteVoz.connect(destinoGrabacion);
  delay.connect(destinoGrabacion);
  fuentePista.connect(destinoGrabacion);

  // 5. Monitoreo
  fuenteVoz.connect(this.audioContext.destination);
  delay.connect(this.audioContext.destination);
  fuentePista.connect(this.audioContext.destination);

  // --- NUEVA LÓGICA DE UNIÓN AUDIO + VIDEO ---

  let streamA_Grabar: MediaStream;

  if (modo === 'video' && streamCamara) {
    // Si es video, creamos un nuevo Stream que combine:
    // La imagen de la cámara + El audio mezclado con Reverb
    streamA_Grabar = new MediaStream([
      ...streamCamara.getVideoTracks(),           // Captura la imagen
      ...destinoGrabacion.stream.getAudioTracks() // Captura tu mezcla profesional
    ]);
  } else {
    // Si es solo audio, usamos tu destinoGrabacion original
    streamA_Grabar = destinoGrabacion.stream;
  }

  // 6. Iniciar RecordRTC con la mezcla (Respetando tus parámetros)
  this.mediaRecorder = new RecordRTC(streamA_Grabar, {
    type: modo === 'video' ? 'video' : 'audio',
    mimeType: modo === 'video' ? 'video/webm' : 'audio/webm',
    numberOfAudioChannels: 1
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

      // --- CAMBIO AQUÍ ---
      // Añadimos el objeto de configuración como tercer parámetro del post
      resolve(
        this.http.post(`${this.api}/subir`, formData, {
          reportProgress: true,
          observe: 'events'
        })
      );
      // -------------------
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
