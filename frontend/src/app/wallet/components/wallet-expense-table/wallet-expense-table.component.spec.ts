import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletExpenseTableComponent } from './wallet-expense-table.component';

describe('WalletExpenseTableComponent', () => {
  let component: WalletExpenseTableComponent;
  let fixture: ComponentFixture<WalletExpenseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletExpenseTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletExpenseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
