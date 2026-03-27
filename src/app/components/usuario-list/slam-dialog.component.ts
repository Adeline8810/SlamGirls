import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreguntaService } from '../../../services/pregunta.service';
import { RespuestaService } from '../../../services/respuesta.service';
import { AuthService } from '../../../services/auth.service';
import { Pregunta } from '../../../models/pregunta';
import { Respuesta } from '../../../models/respuesta';
import { forkJoin } from 'rxjs';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';

@Component({
  selector: 'app-slam-dialog',
  standalone: true,
  templateUrl: './slam-dialog.component.html',
  styleUrls: ['./slam-dialog.component.css'],
  imports: [CommonModule, FormsModule, MenuBarComponent]
})
export class SlamDialogComponent implements OnInit {
  preguntas: Pregunta[] = [];
  respuestas: { pregunta: Pregunta; texto: string | null; foto?: string | null }[] = [];
  preguntaActual = 0;
  respuestaActual = '';
  foto: File | null = null;
  fotoPreview: string | null = null;
  usuarioId: number | null = null;
  completado = false;

  constructor(
    private preguntaService: PreguntaService,
    private respuestaService: RespuestaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuarioId = this.authService.usuarioId;
    if (!this.usuarioId) {
      console.error('No hay usuario logueado');
      return;
    }

    // Cargar preguntas y respuestas existentes en paralelo
    forkJoin({
      preguntas: this.preguntaService.obtenerPreguntas(),
      respuestas: this.respuestaService.obtenerRespuestasPorUsuario(this.usuarioId)
    }).subscribe({
      next: ({ preguntas, respuestas }) => {
        console.log('Preguntas:', preguntas);
        console.log('Respuestas:', respuestas);

        this.preguntas = preguntas;

        // Inicializar respuestas con datos existentes
        this.respuestas = preguntas.map(p => {
          const respuestaExistente = respuestas.find(r => r.preguntaId === p.id);
          return {
            pregunta: p,
            texto: respuestaExistente?.texto || null,
            foto: respuestaExistente?.fotoUrl || null
          };
        });

        // Inicializar la respuesta actual
        this.respuestaActual = this.respuestas[0]?.texto || '';
        this.fotoPreview = this.respuestas[0]?.foto || null;
      },
      error: err => console.error(err)
    });
  }

  siguientePregunta(): void {
    this.respuestas[this.preguntaActual].texto = this.respuestaActual;
    if (this.preguntaActual === 0 && this.foto) {
      this.respuestas[this.preguntaActual].foto = this.fotoPreview;
    }

    if (this.preguntaActual < this.preguntas.length - 1) {
      this.preguntaActual++;
      this.respuestaActual = this.respuestas[this.preguntaActual].texto || '';
      this.fotoPreview = this.respuestas[this.preguntaActual].foto || null;
    } else {
      this.guardarTodo();
    }
  }

  anteriorPregunta(): void {
    this.respuestas[this.preguntaActual].texto = this.respuestaActual;
    if (this.preguntaActual > 0) {
      this.preguntaActual--;
      this.respuestaActual = this.respuestas[this.preguntaActual].texto || '';
      this.fotoPreview = this.respuestas[this.preguntaActual].foto || null;
    }
  }

  pasarSinResponder(): void {
    this.respuestas[this.preguntaActual].texto = null;
    this.siguientePregunta();
  }

  onFotoSeleccionada(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.foto = file;

    // Previsualización local
    const reader = new FileReader();
    reader.onload = () => this.fotoPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  guardarTodo(): void {
    const respuestasAEnviar = this.respuestas.map(r => ({
      preguntaId: r.pregunta.id!,
      usuarioId: this.usuarioId!,
      texto: r.texto,
      fotoUrl: r.foto ?? null
    }));

    this.respuestaService.guardarRespuestas(respuestasAEnviar).subscribe({
      next: () => {
        this.completado = true;
        alert('Respuestas guardadas correctamente.');
      },
      error: err => console.error(err)
    });
  }
}
