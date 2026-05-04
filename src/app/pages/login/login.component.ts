import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { Router } from '@angular/router';

// FIREBASE
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule]
})
export class LoginComponent {
  // 1. INYECCIONES (Deben ir aquí arriba, no dentro de funciones)
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  form: FormGroup;

  constructor() {
    // 2. Inicializamos el formulario
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    console.log("Intentando login manual...");
    if (this.form.invalid) return;

    const { username, password } = this.form.value;

    this.usuarioService.login(username, password).subscribe({
      next: (u) => {
        localStorage.setItem('usuario', JSON.stringify(u));
        if (u && u.id) {
          localStorage.setItem('usuarioId', u.id.toString());
        }
        console.log('✅ Login manual exitoso');
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        console.error('Error en login manual:', err);
        alert('Usuario o contraseña incorrectos');
      }
    });
  }

loginConGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  signInWithPopup(this.auth, provider)
    .then((result) => {
      const user = result.user;
      const email = user.email || '';

      this.usuarioService.buscarPorEmail(email).subscribe({
        next: (userBD: any) => {
          // Si existe, entramos directo
          localStorage.setItem('usuario', JSON.stringify(userBD));
          localStorage.setItem('usuarioId', userBD.id.toString());
          this.router.navigate(['/inicio']);
        },
        error: (err) => {
          console.log('Usuario no encontrado, registrando...');
          // SI NO EXISTE, LO CREAMOS EN ESE MOMENTO
          const nuevoUsuario: any = {
            username: user.displayName,
            email: user.email,
            password: 'google-auth-user', // Password genérica
            fotoUrl: user.photoURL
          };

          this.usuarioService.register(nuevoUsuario).subscribe({
            next: (creado: any) => {
              localStorage.setItem('usuario', JSON.stringify(creado));
              localStorage.setItem('usuarioId', creado.id.toString());
              this.router.navigate(['/inicio']);
            },
            error: (errorReg) => {
              alert('Error al crear tu cuenta automáticamente.');
            }
          });
        }
      });
    });
}
}
