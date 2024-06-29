import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCardSpendingChartComponent } from './credit-card-spending-chart.component';

describe('CreditCardSpendingChartComponent', () => {
  let component: CreditCardSpendingChartComponent;
  let fixture: ComponentFixture<CreditCardSpendingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditCardSpendingChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditCardSpendingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
