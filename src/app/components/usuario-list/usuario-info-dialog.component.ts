import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule // 👈 Agregamos esto
  ],
  template: `
    <h2 mat-dialog-title>¿Qué es esto</h2>

    <mat-dialog-content>
      <p>
       ¡Hola! 💕
        Este es mi Slam de recuerdos, un espacio para guardar pedacitos de las personas que hicieron especial esta etapa de mi vida —amigos, compañeros, personas queridas y cómplices de mil momentos—.
        La idea es simple: cada quien llena una página con sus respuestas, pensamientos y dedicatorias.
        No importa si nos vemos todos los días o si la vida nos separa un tiempo... este cuadernito digital quedará como un recuerdo de lo que fuimos, lo que compartimos y lo que soñamos. 🌈

        Así que... ¡llénalo con cariño, sinceridad y tu toque personal! 💬✨
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `
})
export class UsuarioInfoDialogComponent {}
