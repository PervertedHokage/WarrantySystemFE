import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsFormV2Component } from './products-form-v2.component';

describe('ProductsFormV2Component', () => {
  let component: ProductsFormV2Component;
  let fixture: ComponentFixture<ProductsFormV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsFormV2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsFormV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
