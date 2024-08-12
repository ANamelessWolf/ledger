import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestFreeSummaryComponent } from './interest-free-summary.component';

describe('InterestFreeSummaryComponent', () => {
  let component: InterestFreeSummaryComponent;
  let fixture: ComponentFixture<InterestFreeSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestFreeSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterestFreeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
