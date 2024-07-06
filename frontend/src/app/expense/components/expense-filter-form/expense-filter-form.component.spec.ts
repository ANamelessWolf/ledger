import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseFilterFormComponent } from './expense-filter-form.component';

describe('ExpenseFilterFormComponent', () => {
  let component: ExpenseFilterFormComponent;
  let fixture: ComponentFixture<ExpenseFilterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseFilterFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpenseFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
