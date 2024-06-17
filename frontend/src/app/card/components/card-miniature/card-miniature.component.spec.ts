import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMiniatureComponent } from './card-miniature.component';

describe('CardMiniatureComponent', () => {
  let component: CardMiniatureComponent;
  let fixture: ComponentFixture<CardMiniatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMiniatureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardMiniatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
