import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCreateFormComponent } from './expense-create-form.component';

describe('ExpenseCreateFormComponent', () => {
  let component: ExpenseCreateFormComponent;
  let fixture: ComponentFixture<ExpenseCreateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCreateFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpenseCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
