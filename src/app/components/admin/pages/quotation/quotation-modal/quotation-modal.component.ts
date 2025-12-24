import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { Quotation } from '../../../../../models/quotation.model';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-quotation-modal',
  templateUrl: './quotation-modal.component.html',
  styleUrls: ['./quotation-modal.component.less'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzSelectModule,
    NzTableModule,
    NzGridModule,
    NzCardModule,
  ],
})
export class QuotationModalComponent implements OnInit {
  quotation: Quotation;
  constructor(
    @Inject(NZ_MODAL_DATA)
    public data: { quotation: Quotation }
  ) {
    this.quotation = data.quotation ?? new Quotation();
  }

  ngOnInit() {}
}
