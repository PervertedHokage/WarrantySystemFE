import { Component, Inject, OnInit } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { WarrantyClaim } from '../../../../../models/warranty-claims/warranty-claim.model';

@Component({
  selector: 'app-warranty-managment-modal',
  templateUrl: './warranty-managment-modal.component.html',
  styleUrls: ['./warranty-managment-modal.component.less'],
  imports: [
    FormsModule,
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
  ],
})
export class WarrantyManagmentModalComponent implements OnInit {
  currentTab = 1;
  warrantyClaim: WarrantyClaim;
  constructor(
    @Inject(NZ_MODAL_DATA)
    public data: { warrantyClaim: WarrantyClaim }
  ) {
    this.warrantyClaim = data.warrantyClaim ?? new WarrantyClaim();
  }

  ngOnInit() {
    console.log(this.warrantyClaim);
  }
  changeTab(newTab: number) {
    this.currentTab = newTab;
  }
  onStatusChange(index: number): void {
    this.warrantyClaim.Status = index + 1;
  }
}
