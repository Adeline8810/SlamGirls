import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuBarComponent } from '../../components/menu-bar/menu-bar.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuBarComponent],
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  constructor(private router: Router) {}

  go(path: string) {
   this.router.navigate([path]);
  }
}
