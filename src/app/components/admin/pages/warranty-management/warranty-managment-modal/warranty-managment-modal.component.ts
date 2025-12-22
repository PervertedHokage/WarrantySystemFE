import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzUploadModule } from 'ng-zorro-antd/upload';

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
    NzTableModule,
    NzUploadModule,
  ],
})
export class WarrantyManagmentModalComponent implements OnInit {
  currentTab = 1;
  constructor() {}

  ngOnInit() {}
  changeTab(newTab: number) {
    this.currentTab = newTab;
  }
}
