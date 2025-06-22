import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestFreeDetailsComponent } from './interest-free-details.component';

describe('InterestFreeDetailsComponent', () => {
  let component: InterestFreeDetailsComponent;
  let fixture: ComponentFixture<InterestFreeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestFreeDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterestFreeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
