import { TestBed } from '@angular/core/testing';

import { AudioKaraoke } from './audio-karaoke';

describe('AudioKaraoke', () => {
  let service: AudioKaraoke;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioKaraoke);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
