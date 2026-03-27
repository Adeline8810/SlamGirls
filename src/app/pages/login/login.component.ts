import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule]
})
export class LoginComponent {

  form: any; // 👈 declaramos la variable

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {

    // 👇 AHORA SÍ: inicializamos dentro del constructor
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;

    const username = this.form.value.username || '';
    const password = this.form.value.password || '';

    this.usuarioService.login(username, password).subscribe({
      next: (u) => {
        localStorage.setItem('usuario', JSON.stringify(u));

        if (u?.username === 'ruthadeline')
          this.router.navigate(['/admin']);
        else
          this.router.navigate(['/slam']);
      },
      error: () => {
        alert('Usuario o contraseña incorrectos');
      }
    });
  }
}
