import { Injectable } from '@angular/core';
import RecordRTC from 'recordrtc';

@Injectable({ providedIn: 'root' })
export class AudioKaraokeService {
  private mediaRecorder: any;
  private audioContext!: AudioContext;
  private stream!: MediaStream;

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

  async detenerYObtenerAudio(): Promise<Blob> {
    return new Promise((resolve) => {
      this.mediaRecorder.stopRecording(() => {
        const blob = this.mediaRecorder.getBlob();
        this.stream.getTracks().forEach(track => track.stop()); // Apagar micro
        resolve(blob);
      });
    });
  }
}
