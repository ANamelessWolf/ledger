import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCardOverviewComponent } from './credit-card-overview.component';

describe('CreditCardOverviewComponent', () => {
  let component: CreditCardOverviewComponent;
  let fixture: ComponentFixture<CreditCardOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditCardOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditCardOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
