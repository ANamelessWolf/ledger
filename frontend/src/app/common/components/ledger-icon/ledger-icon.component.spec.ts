import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgerIconComponent } from './ledger-icon.component';

describe('LedgerIconComponent', () => {
  let component: LedgerIconComponent;
  let fixture: ComponentFixture<LedgerIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LedgerIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LedgerIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
