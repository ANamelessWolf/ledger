import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogItemSelectComponent } from './catalog-item-select.component';

describe('CatalogItemSelectComponent', () => {
  let component: CatalogItemSelectComponent;
  let fixture: ComponentFixture<CatalogItemSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogItemSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatalogItemSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
