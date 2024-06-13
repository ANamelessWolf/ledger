import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardIndexPageComponent } from './card-index-page.component';

describe('CardIndexPageComponent', () => {
  let component: CardIndexPageComponent;
  let fixture: ComponentFixture<CardIndexPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardIndexPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardIndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
