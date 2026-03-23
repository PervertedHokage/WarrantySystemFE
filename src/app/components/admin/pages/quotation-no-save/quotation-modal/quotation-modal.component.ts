import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { Quotation } from '../../../../../models/quotations/quotation.model';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { UserService } from '../../../../../services/user.service';
import { IUser } from '../../../../../models/user.interface';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { WarrantyClaim } from '../../../../../models/warranty-claims/warranty-claim.model';
import { WarrantyClaimManagementService } from '../../../../../services/warranty-claim-management.service';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { QuotationDetail } from '../../../../../models/quotations/quotation-details.model';
import { ProductService } from '../../../../../services/products-service/product.service';
import { SparePart } from '../../../../../models/spare-parts.model';
import { QuotationService } from '../../../../../services/quotations-service/quotation.service';
import { QuotationNoSaveDetailsComponent } from './quotation-details/quotation-details.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { QuotationDTO } from '../../../../../models/quotations/quotation-dto.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { WarrantyClaimDTO } from '../../../../../models/warranty-claims/warranty-claim-dto.model';
import { QuotationDetailDTO } from '../../../../../models/quotations/quotation-detail-dto.model';

@Component({
  selector: 'app-quotation-no-save-modal',
  templateUrl: './quotation-modal.component.html',
  styleUrls: ['./quotation-modal.component.less'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzDatePickerModule,
    NzSelectModule,
    NzTableModule,
    NzGridModule,
    NzCardModule,
    NzIconModule,
    ReactiveFormsModule,
    QuotationNoSaveDetailsComponent,
  ],
})
export class QuotationNoSaveModalComponent implements OnInit {
  currentUser: IUser | null = null;
  warrantyClaimList: WarrantyClaimDTO[] = [];
  quotation: QuotationDTO;
  quotationDetails: QuotationDetail[] = [];
  sparePartList: SparePart[] = [];
  quotationForm: FormGroup<any>;
  quotationDetailForm: FormGroup<any>;
  get details(): FormArray {
    return this.quotationDetailForm.get('Details') as FormArray;
  }
  @ViewChild(QuotationNoSaveDetailsComponent)
  quotationDetailsComp!: QuotationNoSaveDetailsComponent;
  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA)
    public data: { quotation: QuotationDTO; details?: QuotationDetailDTO[] },
    private notification: NzNotificationService,
    private userService: UserService,
    private warrantyClaimService: WarrantyClaimManagementService,
    private productService: ProductService,
    private quotationService: QuotationService,
    private formBuilder: FormBuilder,
  ) {
    this.quotation = data.quotation ?? new QuotationDTO();

    this.quotationForm = this.formBuilder.group({
      Id: [this.quotation.Id],
      QuotationNumber: [this.quotation.QuotationNumber],
      WarrantyClaimId: [this.quotation.WarrantyClaimId, [Validators.required]],
      CustomerName: [{ value: this.quotation.CustomerName, disabled: true }],
      ProductName: [{ value: '', disabled: true }],
      CustomerAddress: [this.quotation.CustomerAddress],
      CustomerEmail: [this.quotation.CustomerEmail],
      CustomerPhoneNumber: [this.quotation.CustomerPhoneNumber],
      SerialNumber: [{ value: '', disabled: true }],
      StatusQuotation: [this.quotation.StatusQuotation],
      Note: [this.quotation.Note],
      StartTime: [this.quotation.StartTime],
      DeadLine: [this.quotation.DeadLine],
      CreatedDate: [this.quotation.CreatedDate],
      CreatedBy: [this.quotation.CreatedBy],
      UpdatedDate: [this.quotation.UpdatedDate],
      UpdatedBy: [this.quotation.UpdatedBy],
      StatusReply: [this.quotation.StatusReply],
      ReplyDate: [this.quotation.ReplyDate],
      ReplyNote: [this.quotation.ReplyNote],
      VATfee: [this.quotation.Vatfee ?? 0],
      IsDeleted: [this.quotation.IsDeleted],
    });
    this.quotationDetailForm = this.formBuilder.group({
      Details: this.formBuilder.array([]),
    });
    this.quotationForm
      .get('WarrantyClaimId')!
      .valueChanges.pipe(
        startWith(this.quotationForm.get('WarrantyClaimId')!.value),
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe((value) => {
        if (!value) return;
        this.warrantyClaimService.getWarrantyClaimById(value).subscribe({
          next: (res) => {
            const data = res.data;
            this.quotationForm.patchValue({
              CustomerName: data.CustomerName,
              CustomerAddress: data.CustomerAddress,
              CustomerEmail: data.CustomerEmail,
              CustomerPhoneNumber: data.CustomerPhoneNumber,
              SerialNumber: data.SerialNumber,
              ProductName: data.ProductName,
            });
            this.quotationForm.get('WarrantyClaimId')?.disable();
          },
        });
      });
  }

  ngOnInit() {
    this.currentUser = this.userService.getUser();
    this.loadWarrantyClaimList();
  }
  loadWarrantyClaimList() {
    this.warrantyClaimService.getWarrantyClaimDropdownData().subscribe({
      next: (res) => {
        this.warrantyClaimList = res.data;
      },
    });
  }
  onChildValueChanged(value: any) {
    this.quotationForm.patchValue({
      VATfee: +value,
    });
  }
  onCancel() {
    this.modalRef.close(false);
  }
  onSave() {
    const data = this.quotationForm.getRawValue();
    const { added, edited, deleted } = this.quotationDetailsComp.checkForm();

    // Since it's no-save, we just return the "full" updated object including details
    // We can simulate what the server would return or just return the arrays
    this.modalRef.close({
      quotation: data,
      details: { added, edited, deleted },
      // Alternatively, just return the final list of active details
      allDetails: this.quotationDetailsComp.quotationDetailsForm.filter(
        (d) => !d.IsDeleted,
      ),
    });
  }
}
