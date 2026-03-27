import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreguntaService } from '../../../services/pregunta.service';
import { RespuestaService } from '../../../services/respuesta.service';
import { Pregunta } from '../../../models/pregunta';
import { Respuesta } from '../../../models/respuesta';
import { MenuBarComponent } from '../../components/menu-bar/menu-bar.component';
import { forkJoin, firstValueFrom } from 'rxjs';
import { TraduccionService } from '../../../services/traduccion.service';
import confetti from 'canvas-confetti';

import { NgxParticlesModule } from "@tsparticles/angular";

import { Engine } from "@tsparticles/engine";


import { loadFull } from "tsparticles"; // Cambiamos loadSlim por loadFull

@Component({
  selector: 'app-slam',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuBarComponent,NgxParticlesModule],
  templateUrl: './slam.component.html',
  styleUrls: ['./slam.component.css']
})
export class SlamComponent implements OnInit {
  preguntas: Pregunta[] = [];
  respuestas: Respuesta[] = [];
  preguntaActual = 0;
  respuestaActual = '';
  fotoFile: File | null = null;
  fotoPreview: string | null = null;
  completado = false;
  usuarioId!: number; // ✅ Ahora siempre será number después de la verificación
  nombreUsuario: string = '';
  fotoUrlServidor: string | null = null;
  idiomaSeleccionado = 'es';
  preguntasTraducidas: { [key: string]: { [id: number]: string } } = {};
  cargandoTraduccion = false;

  cargando: boolean = false;

  constructor(private preguntaService: PreguntaService, private respuestaService: RespuestaService,
    private traduccionService: TraduccionService) {}

ngOnInit(): void {
    const u = localStorage.getItem('usuario');
    this.fotoUrlServidor = localStorage.getItem('user_foto_perfil') || 'assets/img/default.png';

    if (!u) {
      alert('Debes iniciar sesión');
      return;
    }

    const usuarioObj = JSON.parse(u);
    this.usuarioId = usuarioObj.id;
    this.nombreUsuario = usuarioObj.nombre;

    // Cargar preguntas y respuestas existentes en paralelo
    forkJoin({
      preguntas: this.preguntaService.obtenerPreguntas(),
      respuestas: this.respuestaService.obtenerRespuestasPorUsuario(this.usuarioId)
    }).subscribe({
      next: ({ preguntas, respuestas }) => {
        this.preguntas = preguntas;

        // Mapear respuestas existentes
        this.respuestas = preguntas.map(q => {
          const rExistente = respuestas.find(r => r.preguntaId === q.id);
          return {
            id: rExistente?.id,
            preguntaId: q.id,
            usuarioId: this.usuarioId,
            texto: rExistente?.texto || null,
            fotoUrl: rExistente?.fotoUrl || null
          };
        });

        // Configurar la primera pregunta y la foto inicial
        if (this.respuestas.length > 0) {
          this.preguntaActual = 0;
          this.respuestaActual = this.respuestas[0].texto || '';

          const fotoBD = this.respuestas[0].fotoUrl;
          if (fotoBD) {
            // FIX: Si la URL ya es completa, no le pegamos la baseApi
            if (fotoBD.startsWith('http')) {
              this.fotoUrlServidor = fotoBD;
            } else {
              const baseApi = 'https://backend-ruth-slam.onrender.com';
              const cleanPath = fotoBD.startsWith('/') ? fotoBD : '/' + fotoBD;
              this.fotoUrlServidor = `${baseApi}${cleanPath}`;
            }
            this.fotoPreview = this.fotoUrlServidor;
          }
        }
      },
      error: err => console.error('Error al cargar datos iniciales:', err)
    });

    this.respuestaService.reiniciarSlam$.subscribe(() => {
      this.reiniciarCuestionario();
    });
  }

onFotoSeleccionada(ev: any) {
    const f: File = ev.target.files && ev.target.files[0];
    if (!f) return;
    this.fotoFile = f; // <--- ESTE es el archivo real, el binario. ¡Está perfecto!

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = (e.target as any).result;
      this.fotoPreview = result; // <--- USAMOS base64 SOLO para que tú lo veas en pantalla (vista previa)
      //this.fotoUrlServidor = result; // <--- ¡¡BORRA O COMENTA ESTA LÍNEA!! NUNCA pongas base64 aquí.
    };
    reader.readAsDataURL(f);
  }
  anterior() {
    this.respuestas[this.preguntaActual].texto = this.respuestaActual || null;
    if (this.preguntaActual > 0) {
      this.preguntaActual--;
      this.respuestaActual = this.respuestas[this.preguntaActual].texto || '';
      //this.fotoPreview = this.respuestas[this.preguntaActual].fotoUrl || null;
     this.fotoPreview = this.respuestas[this.preguntaActual].fotoUrl || this.fotoUrlServidor;


    }
    this.obtenerTraduccionActual();
  }

  pasar() {
    this.respuestas[this.preguntaActual].texto = null;
    this.siguiente();
  }

  siguiente() {

    //this.lanzarChispitas();
    this.respuestas[this.preguntaActual].texto = this.respuestaActual || null;

    if (this.preguntaActual < this.preguntas.length - 1) {
      this.preguntaActual++;
      this.respuestaActual = this.respuestas[this.preguntaActual].texto || '';
      //this.fotoPreview = this.respuestas[this.preguntaActual].fotoUrl || null;
this.fotoPreview = this.respuestas[this.preguntaActual].fotoUrl || this.fotoUrlServidor;
      // Animación opcional de "bounce"
      const title = document.querySelector('.slam-title');
      if (title) {
        title.classList.add('bounce');
        setTimeout(() => title.classList.remove('bounce'), 300);
      }
    } else {
      this.guardarTodo();
    }

    this.obtenerTraduccionActual();
  }


async guardarTodo() {
    this.respuestas[this.preguntaActual].texto = this.respuestaActual || null;

    try {
      if (this.fotoFile) {
        const idParaSubir = this.usuarioId.toString();

        // Subimos el archivo y esperamos la respuesta del servidor
        const pathRelativo = await firstValueFrom(this.respuestaService.subirFoto(this.fotoFile, idParaSubir));

        const baseApi = 'https://backend-ruth-slam.onrender.com';
        let urlCompleta = '';

        // FIX CRÍTICO: Evitar duplicar la URL de Render
        if (pathRelativo.startsWith('http')) {
          urlCompleta = `${pathRelativo}?v=${new Date().getTime()}`;
        } else {
          const cleanPath = pathRelativo.startsWith('/') ? pathRelativo : '/' + pathRelativo;
          urlCompleta = `${baseApi}${cleanPath}?v=${new Date().getTime()}`;
        }

        // Sincronizamos las respuestas con la nueva URL limpia
        this.respuestas.forEach(r => r.fotoUrl = urlCompleta);
        this.fotoUrlServidor = urlCompleta;
        this.fotoPreview = urlCompleta;

        localStorage.setItem('user_foto_perfil', urlCompleta);
      }
    } catch (err) {
      console.error('Error al subir foto:', err);
      alert('Hubo un problema al subir la imagen.');
      return;
    }

    // Guardar el resto de respuestas (texto)
    this.respuestaService.guardarRespuestas(this.respuestas).subscribe({
      next: () => {
        this.completado = true;
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      },
      error: err => {
        console.error('Error al guardar respuestas:', err);
        alert('Error al guardar respuestas');
      }
    });
  }



// Método para cambiar idioma
cambiarIdioma(lang: string) {
  this.idiomaSeleccionado = lang;
  this.preguntasTraducidas = {}; // Limpiamos caché al cambiar de idioma
  this.obtenerTraduccionActual();
}



obtenerTraduccionActual() {
  const pregunta = this.preguntas[this.preguntaActual];
  const idPregunta = pregunta.id;
  const lang = this.idiomaSeleccionado;

  // 1. Si es español, mostramos el original y salimos
  if (lang === 'es') {
    this.cargando = false;
    return;
  }

  // 2. Si YA tenemos esta pregunta en ESTE idioma, no llamamos al servidor
  if (this.preguntasTraducidas[lang] && this.preguntasTraducidas[lang][idPregunta]) {
    this.cargando = false;
    return;
  }

  // 3. Si no la tenemos, activamos el reloj y pedimos al Backend
  this.cargando = true;
  this.traduccionService.traducir(pregunta.texto, lang).subscribe({
    next: (res) => {
      // Inicializamos el objeto del idioma si no existe
      if (!this.preguntasTraducidas[lang]) {
        this.preguntasTraducidas[lang] = {};
      }
      // Guardamos la respuesta (res es el string que viene de Railway)
      this.preguntasTraducidas[lang][idPregunta] = res;
      this.cargando = false;
    },
    error: (err) => {
      console.error('Error en Railway:', err);
      this.cargando = false;
    }
  });
}


reiniciarCuestionario() {
    this.preguntaActual = 0;      // Volver a la pregunta 1
    this.completado = false;      // Ocultar el mensaje de "Gracias"

    // Cargamos el texto de la primera pregunta si ya existía
    this.respuestaActual = this.respuestas[0]?.texto || '';

    // Cargamos la foto de la primera pregunta o la de perfil
    this.fotoPreview = this.respuestas[0]?.fotoUrl || this.fotoUrlServidor;

    // Opcional: Si quieres que las chispitas salgan al volver
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }


  public particlesOptions = {
    fpsLimit: 120,
    particles: {
      color: {
        // AQUÍ PONEMOS TUS COLORES: Rosa, Plata y Fucsia
        value: ["#ff69b4", "#C0C0C0", "#FF1493"]
      },
      links: {
        enable: false
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out"
        },
        random: true,
        speed: { min: 0.1, max: 1 }, // Movimiento muy suave y lento
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 150 // Cantidad de brillos
      },
      opacity: {
        value: { min: 0.1, max: 0.8 }, // Brillo variable
        animation: {
          enable: true,
          speed: 1,
          sync: false
        }
      },
      shape: {
        type: "circle" // FORMA DE ESTRELLA PARA QUE BRILLE MÁS
      },
      size: {
        value: { min: 1, max: 3 }, // Tamaño variable
        animation: {
          enable: true,
          speed: 2,
          sync: false
        }
      },
      twinkle: { // EFECTO DE BRILLO PARPADEANTE
        particles: {
          enable: true,
          color: {
            value: ["#ffffff", "#ff85a2"] // Brillo blanco y rosa
          },
          frequency: 0.05,
          opacity: 1
        }
      }
    },
    detectRetina: true,
      fullScreen: {
      enable: true,
      zIndex: 0 // Detrás de todo el contenido
    },
    background: {
      color: "transparent" // Fondo transparente
    }

  };

public particlesInit = async (engine: Engine): Promise<void> => {
  await loadFull(engine); // Usamos loadFull aquí también
};


}
