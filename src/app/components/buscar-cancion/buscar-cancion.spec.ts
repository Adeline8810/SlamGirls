import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarCancion } from './buscar-cancion';

describe('BuscarCancion', () => {
  let component: BuscarCancion;
  let fixture: ComponentFixture<BuscarCancion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarCancion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarCancion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
