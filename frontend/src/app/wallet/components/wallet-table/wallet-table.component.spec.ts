import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletTableComponent } from './wallet-table.component';

describe('WalletTableComponent', () => {
  let component: WalletTableComponent;
  let fixture: ComponentFixture<WalletTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
