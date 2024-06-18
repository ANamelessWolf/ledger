import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCardChartComponent } from './credit-card-chart.component';

describe('CreditCardChartComponent', () => {
  let component: CreditCardChartComponent;
  let fixture: ComponentFixture<CreditCardChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditCardChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditCardChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
