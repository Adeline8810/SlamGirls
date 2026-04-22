import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recargar } from './recargar';

describe('Recargar', () => {
  let component: Recargar;
  let fixture: ComponentFixture<Recargar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recargar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recargar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
