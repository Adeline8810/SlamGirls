import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Usuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './usuario-form.component.html'
})
export class UsuarioFormComponent {
  form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UsuarioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Usuario | null,
    private usuarioService: UsuarioService
  ) {
    this.form = this.fb.group({
      username: [data?.username || '', Validators.required],
      nombre: [data?.nombre || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      password: [''] // opcional
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

  const payload: Partial<Usuario> = {
  id: this.form.value.id,        // puede existir o no
  nombre: this.form.value.nombre,
  username: this.form.value.username,
  email: this.form.value.email,
  password: this.form.value.password,
};

    this.saving = true;

    if (this.data && this.data.id) {
      // actualizar
      this.usuarioService.actualizarUsuario(this.data.id, payload)
        .pipe(finalize(() => this.saving = false))
        .subscribe({
          next: updated => this.dialogRef.close(updated),
          error: err => {
            console.error('Error actualizando usuario:', err);
            this.saving = false;
          }
        });
    } else {
      // crear
      this.usuarioService.agregarUsuario(payload)
        .pipe(finalize(() => this.saving = false))
        .subscribe({
          next: created => this.dialogRef.close(created),
          error: err => {
            console.error('Error creando usuario:', err);
            this.saving = false;
          }
        });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
