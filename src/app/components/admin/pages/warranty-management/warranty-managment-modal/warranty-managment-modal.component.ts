import { BASE_URL } from '../../../../../runtime';
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
import { WarrantyClaimAttachment } from '../../../../../models/warranty-claims/warranty-claim-attachment.model';
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
import { WarrantyWorkOrderNoSaveComponent } from './warranty-work-order-no-save/warranty-work-order-no-save.component';
import { WarrantySuppliesComponent } from './warranty-supplies/warranty-supplies.component';
import { WarrantyResponseHistoryComponent } from './warranty-response-history/warranty-response-history.component';
import { WorkOrderService } from '../../../../../services/work-order-service/work-order.service';

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
    NzPopoverModule,
    NgTemplateOutlet,
    NzSwitchModule,
    QuotationNoSaveComponent,
    WarrantyWorkOrderNoSaveComponent,
    WarrantySuppliesComponent,
    WarrantyResponseHistoryComponent,
  ],
})
export class WarrantyManagmentModalComponent implements OnInit {
  @ViewChild(QuotationNoSaveComponent)
  quotationNoSaveComp?: QuotationNoSaveComponent;
  @ViewChild(WarrantyWorkOrderNoSaveComponent)
  workOrderNoSaveComp?: WarrantyWorkOrderNoSaveComponent;
  @ViewChild(WarrantySuppliesComponent)
  suppliesComp?: WarrantySuppliesComponent;
  @ViewChild(WarrantyResponseHistoryComponent)
  responseHistoryComp?: WarrantyResponseHistoryComponent;
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
  baseUrl = this.baseUrl;

  constructor(@Inject(NZ_MODAL_DATA)
    public data: { warrantyClaim: WarrantyClaimDTO },
    private notification: NzNotificationService,
    private warrantyClaimService: WarrantyClaimManagementService,
    private issueService: IssuesService,
    private userService: UserManagementService,
    private landingPageService: LandingPageService,
    private productService: ProductService,
    private quotationService: QuotationService,
    private workOrderService: WorkOrderService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,, @Inject(BASE_URL) private baseUrl: string) {
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
            const quotationToSave = new Quotation();
            quotationToSave.Id = q.Id && q.Id < 0 ? 0 : q.Id;
            quotationToSave.QuotationNumber = q.QuotationNumber;
            quotationToSave.WarrantyClaimId = claimId;
            quotationToSave.CustomerName = q.CustomerName;
            quotationToSave.CustomerEmail = q.CustomerEmail;
            quotationToSave.CustomerPhoneNumber = q.CustomerPhoneNumber;
            quotationToSave.CustomerAddress = q.CustomerAddress;
            quotationToSave.StatusQuotation = q.StatusQuotation;
            quotationToSave.Note = q.Note;
            quotationToSave.StartTime = q.StartTime;
            quotationToSave.DeadLine = q.DeadLine;
            quotationToSave.StatusReply = q.StatusReply;
            quotationToSave.ReplyDate = q.ReplyDate;
            quotationToSave.ReplyNote = q.ReplyNote;
            quotationToSave.Vatfee = q.Vatfee ?? 0;
            quotationToSave.IsDeleted = q.IsDeleted;

            obs.push(
              this.quotationService.saveOrUpdate(quotationToSave).pipe(
                switchMap((qRes) => {
                  const details = detailsMap.get(q.Id) || [];
                  if (details.length > 0) {
                    const detailsToSave = details.map((d) => {
                      const detail = new QuotationDetail();
                      detail.Id = d.Id && d.Id < 0 ? 0 : d.Id;
                      detail.QuotationId = qRes.data.Id;
                      detail.SparePartId = d.SparePartId;
                      detail.Quantity = d.Quantity;
                      detail.Price = d.Price;
                      detail.IsDeleted = d.IsDeleted;
                      return detail;
                    });
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

        // Save work orders from no-save component
        if (this.workOrderNoSaveComp) {
          const dataset = this.workOrderNoSaveComp.datasetWorkOrder;
          const sparePartsMap = this.workOrderNoSaveComp.sparePartsMap;
          const deletedIds = this.workOrderNoSaveComp.deletedWorkOrderIds;

          const woObs: any[] = [];

          // Handle deletions
          if (deletedIds.length > 0) {
            woObs.push(this.workOrderService.deleteWorkOrders(deletedIds));
          }

          // Handle Add/Edit
          dataset.forEach((wo) => {
            const spareParts = sparePartsMap.get(wo.Id) || [];
            const payload = {
              WorkOrder: {
                Id: wo.Id && wo.Id < 0 ? 0 : wo.Id,
                WarrantyClaimsId: claimId,
                DateStart: wo.DateStart,
                CompletedDate: wo.CompletedDate,
                UsersId: wo.UsersId || wo.UserId,
                StatusId: wo.StatusId || wo.Status,
                ProductId: wo.ProductId,
                DateEnd: wo.DateEnd,
                ProgressComplete: wo.ProgressComplete,
                Description: wo.Description,
              },
              WorkOrderSpareParts: spareParts.map((sp) => ({
                Id: sp.Id && sp.Id < 0 ? 0 : sp.Id,
                SparePartGroupId: sp.SparePartGroupId,
                Quantity: sp.Quantity,
              })),
              DeletedSpareSpart: [],
            };
            woObs.push(this.workOrderService.saveDataWorkOrder(payload));
          });

          if (woObs.length > 0) {
            forkJoin(woObs).subscribe({
              next: () => {
                this.notification.success(
                  'Thông báo',
                  'Lưu lệnh sửa chữa thành công',
                );
              },
              error: (err) => {
                this.notification.error('Lỗi', 'Lưu lệnh sửa chữa thất bại');
              },
            });
          }
        }

        // Save Supplies
        if (this.suppliesComp) {
          const added = this.suppliesComp.getAddedItems();
          const updated = this.suppliesComp.getUpdatedItems();
          const deletedIds = this.suppliesComp.getDeletedIds();
          const sObs: any[] = [];

          if (deletedIds.length > 0) {
            deletedIds.forEach((id) =>
              sObs.push(this.suppliesComp!.suppliesService.delete(id)),
            );
          }

          added.forEach((item) => {
            const payload = { ...item, Id: 0, WarrantyClaimId: claimId };
            sObs.push(this.suppliesComp!.suppliesService.create(payload));
          });

          updated.forEach((item) => {
            sObs.push(
              this.suppliesComp!.suppliesService.update(item.Id, {
                ...item,
                WarrantyClaimId: claimId,
              }),
            );
          });

          if (sObs.length > 0) {
            forkJoin(sObs).subscribe({
              next: () =>
                this.notification.success('Thông báo', 'Lưu vật tư thành công'),
              error: () =>
                this.notification.error('Lỗi', 'Lưu vật tư thất bại'),
            });
          }
        }

        // Save Response History
        if (this.responseHistoryComp) {
          const added = this.responseHistoryComp.getAddedItems();
          const updated = this.responseHistoryComp.getUpdatedItems();
          const deletedIds = this.responseHistoryComp.getDeletedIds();
          const hObs: any[] = [];

          if (deletedIds.length > 0) {
            deletedIds.forEach((id) =>
              hObs.push(
                this.responseHistoryComp!.responseHistoryService.delete(id),
              ),
            );
          }

          added.forEach((item) => {
            const payload = { ...item, Id: 0, WarrantyClaimId: claimId };
            hObs.push(
              this.responseHistoryComp!.responseHistoryService.create(payload),
            );
          });

          updated.forEach((item) => {
            hObs.push(
              this.responseHistoryComp!.responseHistoryService.update(item.Id, {
                ...item,
                WarrantyClaimId: claimId,
              }),
            );
          });

          if (hObs.length > 0) {
            forkJoin(hObs).subscribe({
              next: () =>
                this.notification.success(
                  'Thông báo',
                  'Lưu lịch sử phản hồi thành công',
                ),
              error: () =>
                this.notification.error('Lỗi', 'Lưu lịch sử phản hồi thất bại'),
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

  downloadAttachment(attachment: WarrantyClaimAttachment) {
    const url = this.baseUrl + attachment.FilePath;
    window.open(url, '_blank');
  }

  onUploadAttachment(event: any) {
    const files: File[] = event.target.files || event.fileList?.map((f: any) => f.originFileObj) || [];
    if (files.length > 0) {
      this.landingPageService.uploadFiles(this.warrantyClaim.Id, files).subscribe({
        next: (res) => {
          this.notification.success('Thông báo', 'Tải lên tài liệu thành công');
          this.warrantyClaim.Attachments = [...(this.warrantyClaim.Attachments || []), ...res.data];
          this.cdr.detectChanges();
        },
        error: () => {
          this.notification.error('Lỗi', 'Tải lên tài liệu thất bại');
        }
      });
    }
  }

  deleteAttachment(attachment: WarrantyClaimAttachment) {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) {
      // Assuming there's a delete endpoint or we just remove it from the list for now
      // If there's no BE delete yet, we might need to add it or just advise user
      this.warrantyClaim.Attachments = this.warrantyClaim.Attachments.filter(a => a.Id !== attachment.Id);
      this.notification.info('Thông báo', 'Đã xóa tài liệu khỏi danh sách (tạm thời)');
    }
  }
}
