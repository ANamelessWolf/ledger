import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoNoIntIndexPageComponent } from './mo-no-int-index-page.component';

describe('MoNoIntIndexPageComponent', () => {
  let component: MoNoIntIndexPageComponent;
  let fixture: ComponentFixture<MoNoIntIndexPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoNoIntIndexPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MoNoIntIndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
