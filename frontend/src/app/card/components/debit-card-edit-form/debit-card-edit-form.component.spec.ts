import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitCardEditFormComponent } from './debit-card-edit-form.component';

describe('DebitCardEditFormComponent', () => {
  let component: DebitCardEditFormComponent;
  let fixture: ComponentFixture<DebitCardEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebitCardEditFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DebitCardEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
