import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cantar } from './cantar';

describe('Cantar', () => {
  let component: Cantar;
  let fixture: ComponentFixture<Cantar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cantar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cantar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
