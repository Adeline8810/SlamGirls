import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilAjeno } from './perfil-ajeno';

describe('PerfilAjeno', () => {
  let component: PerfilAjeno;
  let fixture: ComponentFixture<PerfilAjeno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilAjeno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilAjeno);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
