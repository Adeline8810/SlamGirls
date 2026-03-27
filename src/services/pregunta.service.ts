import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pregunta } from '../models/pregunta';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PreguntaService {

private api = 'https://backend-ruth-slam.onrender.com/api/preguntas';
  constructor(private http: HttpClient) {}

  obtenerPreguntas(): Observable<Pregunta[]> {
    return this.http.get<Pregunta[]>(this.api);
  }
}
