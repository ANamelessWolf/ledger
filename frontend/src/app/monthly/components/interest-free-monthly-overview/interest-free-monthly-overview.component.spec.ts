import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestFreeMonthlyOverviewComponent } from './interest-free-monthly-overview.component';

describe('InterestFreeMonthlyOverviewComponent', () => {
  let component: InterestFreeMonthlyOverviewComponent;
  let fixture: ComponentFixture<InterestFreeMonthlyOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestFreeMonthlyOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterestFreeMonthlyOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
