import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerLive } from './ver-live';

describe('VerLive', () => {
  let component: VerLive;
  let fixture: ComponentFixture<VerLive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerLive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerLive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
