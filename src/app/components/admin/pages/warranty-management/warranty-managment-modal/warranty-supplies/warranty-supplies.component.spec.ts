import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarrantySuppliesComponent } from './warranty-supplies.component';

describe('WarrantySuppliesComponent', () => {
  let component: WarrantySuppliesComponent;
  let fixture: ComponentFixture<WarrantySuppliesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarrantySuppliesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WarrantySuppliesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
