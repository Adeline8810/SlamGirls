import { Injectable } from '@angular/core';
import RecordRTC from 'recordrtc';
import { HttpClient } from '@angular/common/http'; // <--- Importante
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudioKaraokeService {

  constructor(private http: HttpClient) { }

  private mediaRecorder: any;
  private audioContext!: AudioContext;
  private stream!: MediaStream;
   private api = 'https://backend-ruth-slam.onrender.com//api/cantos';

  async iniciarGrabacionConEfecto() {
    // 1. Pedir permiso al micrófono
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // 2. Crear el "Estudio Virtual" (Audio Context)
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);

    // 3. Crear efecto de REVERB (Eco suave)
    const delay = this.audioContext.createDelay();
    delay.delayTime.value = 0.1; // Un poquito de eco

    const feedback = this.audioContext.createGain();
    feedback.gain.value = 0.3; // Qué tanto se repite el eco

    // 4. Conectar los cables virtuales
    source.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);

    const output = this.audioContext.createMediaStreamDestination();
    source.connect(output);
    delay.connect(output);

    delay.connect(this.audioContext.destination);
    source.connect(this.audioContext.destination);

    // 5. Configurar el grabador para que guarde la voz CON el efecto
    this.mediaRecorder = new RecordRTC(output.stream, {
      type: 'audio',
      mimeType: 'audio/wav',
      recorderType: RecordRTC.StereoAudioRecorder
    });

    this.mediaRecorder.startRecording();
  }



async detenerYEnviarAlServidor(): Promise<Observable<any>> {
    return new Promise((resolve) => {
      this.mediaRecorder.stopRecording(() => {
        const audioBlob = this.mediaRecorder.getBlob();

        // Cerramos el micro para que se apague la luz de grabación
        if (this.audioContext) this.audioContext.close();

        // Preparamos el FormData (el sobre para Java)
        const formData = new FormData();
        formData.append('archivo', audioBlob, 'mi_voz_karaoke.wav');

        // Retornamos el "disparo" hacia el backend
        resolve(this.http.post(`${this.api}/subir`, formData));
      });
    });


}

}
