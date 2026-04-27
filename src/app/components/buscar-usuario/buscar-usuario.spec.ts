import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarUsuario } from './buscar-usuario';

describe('BuscarUsuario', () => {
  let component: BuscarUsuario;
  let fixture: ComponentFixture<BuscarUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
