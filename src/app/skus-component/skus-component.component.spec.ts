import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkusComponentComponent } from './skus-component.component';

describe('SkusComponentComponent', () => {
  let component: SkusComponentComponent;
  let fixture: ComponentFixture<SkusComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkusComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkusComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
