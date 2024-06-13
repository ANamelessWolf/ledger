import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavMenuFooterComponent } from './nav-menu-footer.component';

describe('NavMenuFooterComponent', () => {
  let component: NavMenuFooterComponent;
  let fixture: ComponentFixture<NavMenuFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavMenuFooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavMenuFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
