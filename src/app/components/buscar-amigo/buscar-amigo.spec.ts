import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarAmigo } from './buscar-amigo';

describe('BuscarAmigo', () => {
  let component: BuscarAmigo;
  let fixture: ComponentFixture<BuscarAmigo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarAmigo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarAmigo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
