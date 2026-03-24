import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { WarrantyClaimDTO } from '../../../../../models/warranty-claims/warranty-claim-dto.model';
import { WarrantyClaimManagementService } from '../../../../../services/warranty-claim-management.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { IssueFullDTO } from '../../../../../models/issue-full-dto.model';
import { IssuesService } from '../../../../../services/issues-service/issues.service';
import { NOTIFICATION_TITLE } from '../../../../../app.config';
import { UserManagementService } from '../../../../../services/user-service/user-management.service';
import { IUser } from '../../../../../models/user.interface';
import { QuotationService } from '../../../../../services/quotations-service/quotation.service';
import { Quotation } from '../../../../../models/quotations/quotation.model';
import { QuotationDetail } from '../../../../../models/quotations/quotation-details.model';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WarrantyClaimTracking } from '../../../../../models/warranty-claims/warranty-claim-tracking.model';
import { LandingPageService } from '../../../../../services/landing-page.service';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { Product } from '../../../../../models/product.model';
import { ProductService } from '../../../../../services/products-service/product.service';
import { QuotationNoSaveComponent } from '../../quotation-no-save/quotation-no-save.component';
import { WarrantyWorkOrderComponent } from './warranty-work-order/warranty-work-order.component';
import { WarrantySuppliesComponent } from './warranty-supplies/warranty-supplies.component';
import { WarrantyResponseHistoryComponent } from './warranty-response-history/warranty-response-history.component';

@Component({
  selector: 'app-warranty-managment-modal',
  templateUrl: './warranty-managment-modal.component.html',
  styleUrls: ['./warranty-managment-modal.component.less'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzDatePickerModule,
    NzModalModule,
    NzSplitterModule,
    NzCheckboxModule,
    NzSelectModule,
    NzSliderModule,
    NzStepsModule,
    NzTableModule,
    NzUploadModule,
    NzRadioModule,
    NzStepsModule,
    NzPopoverModule,
    NgTemplateOutlet,
    NzSwitchModule,
    QuotationNoSaveComponent,
    WarrantyWorkOrderComponent,
    WarrantySuppliesComponent,
    WarrantyResponseHistoryComponent,
  ],
})
export class WarrantyManagmentModalComponent implements OnInit {
  @ViewChild(QuotationNoSaveComponent)
  quotationNoSaveComp?: QuotationNoSaveComponent;
  validateForm!: FormGroup;
  currentTab = 1;
  warrantyClaim: WarrantyClaimDTO = new WarrantyClaimDTO();
  productList: Product[] = [];
  issueList: IssueFullDTO[] = [];
  userList: IUser[] = [];
  activeIndex: number = 0;
  currentTracking: WarrantyClaimTracking = new WarrantyClaimTracking({
    Id: 0,
    WarrantyClaimId: this.warrantyClaim.Id,
    StatusText: '',
    Note: '',
    IsActive: true,
    CreatedDate: new Date(),
  });
  trackings: WarrantyClaimTracking[] = [];
  deletedTrackings: WarrantyClaimTracking[] = [];
  loadedTabs: Set<number> = new Set([1]);

  constructor(
    @Inject(NZ_MODAL_DATA)
    public data: { warrantyClaim: WarrantyClaimDTO },
    private notification: NzNotificationService,
    private warrantyClaimService: WarrantyClaimManagementService,
    private issueService: IssuesService,
    private userService: UserManagementService,
    private landingPageService: LandingPageService,
    private productService: ProductService,
    private quotationService: QuotationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    const input = data.warrantyClaim ?? new WarrantyClaimDTO();
    this.warrantyClaim = new WarrantyClaimDTO(input);
    this.initForm();
    if (input.Id) {
      this.warrantyClaimService.getWarrantyClaimById(input.Id).subscribe({
        next: (res) => {
          this.warrantyClaim = res.data;
          this.validateForm.patchValue(this.warrantyClaim);
          console.log(this.warrantyClaim);
          this.cdr.detectChanges();
          this.loadTracking();
        },
        error: (err) => {},
      });
    }
    this.loadIssues();
    this.loadProducts();
    this.loadUsers();
  }

  ngOnInit() {}

  private initForm() {
    this.validateForm = this.fb.group({
      CustomerName: [this.warrantyClaim.CustomerName, [Validators.required]],
      CustomerPhoneNumber: [
        this.warrantyClaim.CustomerPhoneNumber,
        [Validators.required],
      ],
      CustomerEmail: [
        this.warrantyClaim.CustomerEmail,
        [Validators.required, Validators.email],
      ],
      CustomerAddress: [
        this.warrantyClaim.CustomerAddress,
        [Validators.required],
      ],
      ProductId: [this.warrantyClaim.ProductId, [Validators.required]],
      SerialNumber: [this.warrantyClaim.SerialNumber, [Validators.required]],
      IssueId: [this.warrantyClaim.IssueId, [Validators.required]],
    });
  }
  changeTab(newTab: number) {
    this.currentTab = newTab;
    this.loadedTabs.add(newTab);
  }
  onStatusChange(index: number): void {
    this.warrantyClaim.Status = index + 1;
  }
  loadIssues() {
    this.issueService.getIssues(0).subscribe({
      next: (res) => {
        this.issueList = res.data;
      },
      error: (err) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          'Load dữ liệu hiện tượng hỏng thất bại',
        );
      },
    });
  }
  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.userList = res.data;
      },
      error: (err) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          'Load dữ liệu người dùng thất bại',
        );
      },
    });
  }
  loadProducts() {
    this.productService.getDataProducts().subscribe({
      next: (res) => {
        this.productList = res.data;
      },
      error: (err) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          'Load dữ liệu sản phẩm thất bại',
        );
      },
    });
  }
  loadTracking() {
    this.landingPageService
      .getWarrantyClaimTrackings(this.warrantyClaim.Id)
      .subscribe({
        next: (result) => {
          this.trackings = result.data;
          this.activeIndex = this.trackings.findIndex((t) => t.IsActive);
        },
      });
  }
  onIndexChange(index: number): void {
    this.activeIndex = index;
    this.currentTracking = this.trackings[index];
  }
  onAddTracking() {
    if (!this.currentTracking.Note) {
      this.currentTracking.Note =
        this.currentTracking.CreatedDate.toISOString().split('T')[0];
    }
    this.trackings.push(this.currentTracking);
    this.trackings = [...this.trackings].sort((a, b) => {
      const da = new Date(a.CreatedDate ?? 0).getTime();
      const db = new Date(b.CreatedDate ?? 0).getTime();
      return da - db;
    });
    this.currentTracking = new WarrantyClaimTracking({
      Id: 0,
      WarrantyClaimId: this.warrantyClaim.Id,
      StatusText: '',
      Note: '',
      IsActive: false,
      CreatedDate: new Date(),
    });
  }
  onDeleteTracking() {
    const confirmed = confirm('Bạn có chắc chắn muốn xóa không?');
    if (!confirmed) return;
    const deleted = this.trackings.splice(this.activeIndex, 1);
    this.deletedTrackings.push(...deleted);
    this.trackings = [...this.trackings].sort((a, b) => {
      const da = new Date(a.CreatedDate ?? 0).getTime();
      const db = new Date(b.CreatedDate ?? 0).getTime();
      return da - db;
    });
    this.currentTracking = new WarrantyClaimTracking({
      Id: 0,
      WarrantyClaimId: this.warrantyClaim.Id,
      StatusText: '',
      Note: '',
      IsActive: false,
      CreatedDate: new Date(),
    });
  }
  onUnselectTracking() {
    this.currentTracking = new WarrantyClaimTracking({
      Id: 0,
      WarrantyClaimId: this.warrantyClaim.Id,
      StatusText: '',
      Note: '',
      IsActive: false,
      CreatedDate: new Date(),
    });
  }
  onSave(): boolean {
    Object.values(this.validateForm.controls).forEach((control) => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });

    if (this.validateForm.invalid) {
      this.notification.warning(
        'Thông báo',
        'Vui lòng kiểm tra lại thông tin!',
      );
      return false;
    }

    // Sync form values back to warrantyClaim
    Object.assign(this.warrantyClaim, this.validateForm.getRawValue());

    console.log(this.warrantyClaim);
    this.warrantyClaimService.createOrUpdate(this.warrantyClaim).subscribe({
      next: (res) => {
        const claimId = res.data.Id;
        // Save trackings
        this.trackings.forEach((track) => {
          track.WarrantyClaimId = claimId;
          if (!track.Id)
            this.landingPageService
              .createWarrantyClaimTrackings(track)
              .subscribe({
                next: () => {},
              });
          else
            this.landingPageService
              .updateWarrantyClaimTrackings(track)
              .subscribe({
                next: () => {},
              });
        });
        this.deletedTrackings.forEach((d) => {
          this.landingPageService.deleteWarrantyClaimTrackings(d).subscribe({
            next: () => {},
          });
        });

        // Save quotations from no-save component
        if (this.quotationNoSaveComp) {
          const dataset = this.quotationNoSaveComp.dataset;
          const deletedIds = this.quotationNoSaveComp.deletedIds;
          const detailsMap = this.quotationNoSaveComp.detailsMap;

          const obs: any[] = [];

          // Handle deletions
          deletedIds.forEach((id) => {
            obs.push(
              this.quotationService.update(
                new Quotation({ Id: id, IsDeleted: true }),
              ),
            );
          });

          // Handle Add/Edit
          dataset.forEach((q) => {
            const quotationToSave = new Quotation({
              ...q,
              Vatfee: q.Vatfee ?? 0,
            });
            quotationToSave.WarrantyClaimId = claimId;
            obs.push(
              this.quotationService.saveOrUpdate(quotationToSave).pipe(
                switchMap((qRes) => {
                  const details = detailsMap.get(q.Id) || [];
                  if (details.length > 0) {
                    const detailsToSave = details.map(
                      (d) =>
                        new QuotationDetail({
                          ...d,
                          QuotationId: qRes.data.Id,
                        }),
                    );
                    return this.quotationService.saveDetails(detailsToSave);
                  }
                  return of(null);
                }),
              ),
            );
          });

          if (obs.length > 0) {
            forkJoin(obs).subscribe({
              next: () => {
                this.notification.success(
                  'Thông báo',
                  'Lưu báo giá thành công',
                );
              },
              error: (err) => {
                this.notification.error('Lỗi', 'Lưu báo giá thất bại');
              },
            });
          }
        }

        this.notification.success('Thông báo', 'Cập nhật thành công!');
      },
      error: (err) => {
        console.log(err);
        this.notification.error('Lỗi', 'Thao tác thất bại');
      },
    });

    return true;
  }
}
