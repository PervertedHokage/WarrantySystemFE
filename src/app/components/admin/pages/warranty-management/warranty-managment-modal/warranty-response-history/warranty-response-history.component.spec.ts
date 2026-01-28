import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarrantyResponseHistoryComponent } from './warranty-response-history.component';

describe('WarrantyResponseHistoryComponent', () => {
  let component: WarrantyResponseHistoryComponent;
  let fixture: ComponentFixture<WarrantyResponseHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarrantyResponseHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WarrantyResponseHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
