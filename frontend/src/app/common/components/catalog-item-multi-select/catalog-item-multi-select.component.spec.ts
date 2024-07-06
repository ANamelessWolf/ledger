import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogItemMultiSelectComponent } from './catalog-item-multi-select.component';

describe('CatalogItemMultiSelectComponent', () => {
  let component: CatalogItemMultiSelectComponent;
  let fixture: ComponentFixture<CatalogItemMultiSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogItemMultiSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatalogItemMultiSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
