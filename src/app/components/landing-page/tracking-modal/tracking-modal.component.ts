import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { WarrantyClaim } from '../../../models/warranty-claim.model';
import { TuiConnected, TuiStepper } from '@taiga-ui/kit';
import { WarrantyClaimTracking } from '../../../models/warranty-claim-tracking.model';
import { LandingPageService } from '../../../services/landing-page.service';

@Component({
  selector: 'app-tracking-modal',
  templateUrl: './tracking-modal.component.html',
  styleUrls: ['./tracking-modal.component.less'],
  imports: [TuiConnected, TuiStepper],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackingModalComponent implements OnInit {
  warrantyClaim: WarrantyClaim;
  trackings: WarrantyClaimTracking[] = [];
  activeIndex: number = 0;
  constructor(
    @Inject(NZ_MODAL_DATA)
    public data: { warrantyClaim: WarrantyClaim },
    private landingPageService: LandingPageService,
    private cdr: ChangeDetectorRef
  ) {
    this.warrantyClaim = data.warrantyClaim;
  }

  ngOnInit() {
    this.landingPageService
      .getWarrantyClaimTrackings(this.warrantyClaim.Id)
      .subscribe({
        next: (result) => {
          this.trackings = result.data;
          this.activeIndex = this.trackings.findIndex((t) => t.IsActive);
          this.cdr.detectChanges();
        },
      });
  }
  onClick() {
    console.log(this.activeIndex);

  }
}
