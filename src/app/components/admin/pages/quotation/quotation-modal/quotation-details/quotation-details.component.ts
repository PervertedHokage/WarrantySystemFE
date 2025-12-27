import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { QuotationDetail } from '../../../../../../models/quotations/quotation-details.model';
import { QuotationService } from '../../../../../../services/quotations-service/quotation.service';
import { SparePart } from '../../../../../../models/spare-parts.model';
import { ProductService } from '../../../../../../services/products-service/product.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'quotation-details',
  templateUrl: './quotation-details.component.html',
  styleUrls: ['./quotation-details.component.less'],
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzSelectModule,
    NzInputModule,
  ],
})
export class QuotationDetailsComponent implements OnInit {
  @Input() quotationId!: number;
  @Input() VATfee!: number;
  @Output() valueChanged = new EventEmitter<any>();
  get VATfeeForm() {
    return this.VATfee;
  }
  set VATfeeForm(value: number) {
    this.VATfee = value;
    this.onInputChange(value);
  }
  quotationDetails: QuotationDetail[] = [];
  quotationDetailsForm: QuotationDetail[] = [];

  sparePartList: SparePart[] = [];
  constructor(
    private cdr: ChangeDetectorRef,
    private quotationService: QuotationService,
    private productService: ProductService
  ) {
    this.productService.getAllSpareParts().subscribe({
      next: (res) => {
        this.sparePartList = res.data;
      },
    });
  }

  ngOnInit() {
    this.quotationService.getDetailsById(this.quotationId).subscribe({
      next: (res) => {
        this.quotationDetails = res.data;
        this.quotationDetailsForm = [...this.quotationDetails]; //clone
      },
    });
  }

  addDetail() {
    this.quotationDetailsForm = [
      new QuotationDetail(),
      ...this.quotationDetailsForm,
    ];
    this.cdr.detectChanges();
  }

  deleteDetail(index: number) {
    const confirmed = confirm('Bạn có chắc chắn muốn xóa không?');
    if (!confirmed) return;
    this.quotationDetailsForm[index].IsDeleted = true;
    this.cdr.detectChanges();
  }

  onInputChange(value: any) {
    this.valueChanged.emit(value);
  }
  getSumPrice(VATfee: number) {
    const rawPrice = this.quotationDetailsForm.reduce((acc, cur) => {
      return acc + (cur.IsDeleted ? 0 : (cur.Price ?? 0) * (cur.Quantity ?? 1));
    }, 0);

    return Math.round(rawPrice * (1 + VATfee / 100) * 100) / 100;
  }

  checkForm() {
    const added = this.quotationDetailsForm.filter(
      (d) => (!d.Id || d.Id === 0) && !d.IsDeleted
    );
    const deleted = this.quotationDetailsForm.filter(
      (d) => d.Id && d.Id > 0 && d.IsDeleted
    );
    const edited = this.quotationDetailsForm.filter((current) => {
      if (!current.Id || current.Id === 0) return false;
      if (current.IsDeleted) return false;

      const original = this.quotationDetails.find((o) => o.Id === current.Id);
      if (!original) return false;

      return (
        current.SparePartId !== original.SparePartId ||
        current.Quantity !== original.Quantity ||
        current.Price !== original.Price
      );
    });
    return {
      added,
      edited,
      deleted,
    };
  }
}
