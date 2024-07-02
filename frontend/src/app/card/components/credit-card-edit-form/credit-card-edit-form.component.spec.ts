import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCardEditFormComponent } from './credit-card-edit-form.component';

describe('CreditCardEditFormComponent', () => {
  let component: CreditCardEditFormComponent;
  let fixture: ComponentFixture<CreditCardEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditCardEditFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditCardEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
