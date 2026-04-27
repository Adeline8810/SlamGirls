import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router ,RouterModule} from '@angular/router';
import { TraduccionService } from '../../../services/traduccion.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil-ajeno',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './perfil-ajeno.html',
  styleUrl: './perfil-ajeno.css'
})
export class PerfilAjeno implements OnInit {
  usuario = signal<any>(null);

  constructor(
    private route: ActivatedRoute,
    private service: TraduccionService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtenemos el username de la URL (ej: /perfil/Adeline)
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.usuarioService.obtenerDetallesUsuario(username).subscribe(data => {
        this.usuario.set(data);
      });
    }
  }

  irAlChat() {
    this.router.navigate(['/chat', this.usuario().username]);
  }

  volver() {
  window.history.back();
}
}
