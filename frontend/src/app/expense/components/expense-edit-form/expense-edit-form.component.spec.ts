import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseEditFormComponent } from './expense-edit-form.component';

describe('ExpenseEditFormComponent', () => {
  let component: ExpenseEditFormComponent;
  let fixture: ComponentFixture<ExpenseEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseEditFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpenseEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
