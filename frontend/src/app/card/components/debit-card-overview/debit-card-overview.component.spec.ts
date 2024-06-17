import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitCardOverviewComponent } from './debit-card-overview.component';

describe('DebitCardOverviewComponent', () => {
  let component: DebitCardOverviewComponent;
  let fixture: ComponentFixture<DebitCardOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebitCardOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DebitCardOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
