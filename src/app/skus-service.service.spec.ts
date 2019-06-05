import { TestBed } from '@angular/core/testing';

import { SkusServiceService } from './skus-service.service';

describe('SkusServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SkusServiceService = TestBed.get(SkusServiceService);
    expect(service).toBeTruthy();
  });
});
