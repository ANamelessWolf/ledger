import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestFreeCreditCardPieChartComponent } from './interest-free-credit-card-pie-chart.component';

describe('InterestFreeCreditCardPieChartComponent', () => {
  let component: InterestFreeCreditCardPieChartComponent;
  let fixture: ComponentFixture<InterestFreeCreditCardPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestFreeCreditCardPieChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterestFreeCreditCardPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
