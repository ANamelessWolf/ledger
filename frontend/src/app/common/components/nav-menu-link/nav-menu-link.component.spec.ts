import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavMenuLinkComponent } from './nav-menu-link.component';

describe('NavMenuLinkComponent', () => {
  let component: NavMenuLinkComponent;
  let fixture: ComponentFixture<NavMenuLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavMenuLinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavMenuLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
