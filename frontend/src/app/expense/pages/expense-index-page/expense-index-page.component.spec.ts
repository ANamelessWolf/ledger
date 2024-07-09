import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseIndexPageComponent } from './expense-index-page.component';

describe('ExpenseIndexPageComponent', () => {
  let component: ExpenseIndexPageComponent;
  let fixture: ComponentFixture<ExpenseIndexPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseIndexPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpenseIndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
