import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCardPeriodComponent } from './credit-card-period.component';

describe('CreditCardPeriodComponent', () => {
  let component: CreditCardPeriodComponent;
  let fixture: ComponentFixture<CreditCardPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditCardPeriodComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditCardPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
