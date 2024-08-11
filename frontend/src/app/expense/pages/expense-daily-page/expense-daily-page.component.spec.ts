import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseDailyPageComponent } from './expense-daily-page.component';

describe('ExpenseDailyPageComponent', () => {
  let component: ExpenseDailyPageComponent;
  let fixture: ComponentFixture<ExpenseDailyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseDailyPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpenseDailyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
