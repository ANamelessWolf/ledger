import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletIndexPageComponent } from './wallet-index-page.component';

describe('WalletIndexPageComponent', () => {
  let component: WalletIndexPageComponent;
  let fixture: ComponentFixture<WalletIndexPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletIndexPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletIndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
