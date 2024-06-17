import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardListViewComponent } from './card-list-view.component';

describe('CardListViewComponent', () => {
  let component: CardListViewComponent;
  let fixture: ComponentFixture<CardListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardListViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
