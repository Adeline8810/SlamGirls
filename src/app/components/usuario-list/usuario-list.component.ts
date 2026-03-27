import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';
import { UsuarioInfoDialogComponent } from './usuario-info-dialog.component';
import { SlamDialogComponent } from './slam-dialog.component';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.css']
})
export class UsuarioListComponent implements OnInit {
  usuarios = new MatTableDataSource<Usuario>([]);
  displayedColumns: string[] = ['username','nombre', 'email', 'acciones'];
  loading = false;

  constructor(private dialog: MatDialog, private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios.data = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.loading = false;
      }
    });
  }

  nuevoUsuario(): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usuarioService.agregarUsuario(result).subscribe({
          next: () => this.cargarUsuarios(),
          error: (e) => console.error('Error al agregar usuario:', e)
        });
      }
    });
  }

  editarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '400px',
      data: usuario
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usuarioService.actualizarUsuario(usuario.id!, result).subscribe({
          next: () => this.cargarUsuarios(),
          error: (e) => console.error('Error al actualizar usuario:', e)
        });
      }
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    if (confirm(`¿Seguro que deseas eliminar a ${usuario.nombre}?`)) {
      this.usuarioService.eliminarUsuario(usuario.id!).subscribe({
        next: () => this.cargarUsuarios(),
        error: (e) => console.error('Error al eliminar usuario:', e)
      });
    }
  }

  queEsEsto(): void {
    this.dialog.open(UsuarioInfoDialogComponent, { width: '400px' });
  }

  llenarSlam(): void {
    // ✅ OBTENER el primer usuario seleccionado o advertir si no hay ninguno
    const usuarios = this.usuarios.data;
    if (!usuarios || usuarios.length === 0) {
      alert('Primero debes crear un usuario antes de llenar el Slam 💬');
      return;
    }

    // ✅ Ejemplo: tomamos el primer usuario por ahora (puedes mejorar esto luego)
    const usuarioSeleccionado = usuarios[usuarios.length - 1];

    this.dialog.open(SlamDialogComponent, {
      width: '600px',
      data: { usuarioId: usuarioSeleccionado.id, nombre: usuarioSeleccionado.nombre },
      disableClose: true
    });
  }
}
