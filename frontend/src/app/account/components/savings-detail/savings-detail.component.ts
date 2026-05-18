import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogButton } from '@config/enums';
import { DialogData } from '@common/types/DialogData';
import { SectionModalComponent, SectionModalData } from '../section-modal/section-modal.component';
import { EditAccountModalComponent, EditAccountModalData } from '../edit-account-modal/edit-account-modal.component';
import { AccountService } from '../../services/account.service';
import {
  FinancingAccountDetail,
  FinancingSection,
  SavingDetail,
} from '../../types/account.types';
import { NotificationService } from '@common/services/notification.service';
import { CatalogService } from '@common/services/catalog.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-savings-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './savings-detail.component.html',
  styleUrl: './savings-detail.component.scss',
  providers: [NotificationService],
})
export class SavingsDetailComponent {
  @Input() detail!: FinancingAccountDetail;
  @Output() refresh = new EventEmitter<void>();

  displayedColumns = ['id', 'name', 'balance', 'actions'];

  constructor(
    private dialog: MatDialog,
    private accountService: AccountService,
    private catalogService: CatalogService,
    private notifService: NotificationService
  ) {}

  get account() {
    return this.detail.account;
  }

  get saving(): SavingDetail {
    return this.detail.detail as SavingDetail;
  }

  get mainSection(): FinancingSection | undefined {
    return this.detail.sections.find((s) => s.name === 'main');
  }

  get secondarySections(): FinancingSection[] {
    return this.detail.sections.filter((s) => s.name !== 'main');
  }

  openEditAccount(): void {
    const modalData: EditAccountModalData = { detail: this.detail };

    const dialogData: DialogData = {
      header: 'Edit Account',
      component: EditAccountModalComponent,
      data: modalData,
      validationData: modalData,
      buttons: [DialogButton.SAVE, DialogButton.CANCEL],
      validate: (d: EditAccountModalData) => d.onValidate ? d.onValidate() : false,
    };

    const ref = this.dialog.open(DialogWrapperComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: dialogData,
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result?.button === DialogButton.SAVE && modalData.result) {
        this.accountService.updateAccount(this.account.id, modalData.result).subscribe({
          next: () => this.refresh.emit(),
          error: (err: HttpErrorResponse) => this.notifService.showError(err),
        });
      }
    });
  }

  private openSectionDialog(section?: FinancingSection): void {
    this.catalogService.getCurrencies().subscribe({
      next: (response) => {
        const modalData: SectionModalData = { currencies: response.data, section };

        const dialogData: DialogData = {
          header: section ? 'Edit Section' : 'Add Section',
          component: SectionModalComponent,
          data: modalData,
          validationData: modalData,
          buttons: [DialogButton.SAVE, DialogButton.CANCEL],
          validate: (d: SectionModalData) => d.onValidate ? d.onValidate() : false,
        };

        const ref = this.dialog.open(DialogWrapperComponent, {
          width: '520px',
          maxWidth: '95vw',
          data: dialogData,
        });

        ref.afterClosed().subscribe((result: any) => {
          if (result?.button === DialogButton.SAVE && modalData.result) {
            const action$ = section
              ? this.accountService.updateSection(section.id, modalData.result)
              : this.accountService.createSection(this.account.id, modalData.result);
            action$.subscribe({
              next: () => this.refresh.emit(),
              error: (err: HttpErrorResponse) => this.notifService.showError(err),
            });
          }
        });
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  openAddSection(): void {
    this.openSectionDialog();
  }

  openEditSection(section: FinancingSection): void {
    this.openSectionDialog(section);
  }

  deleteSection(section: FinancingSection): void {
    this.accountService.deleteSection(section.id).subscribe({
      next: () => this.refresh.emit(),
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  projectedEarnings(section: FinancingSection): number | null {
    if (!section.isInvestment || !section.investmentRate) return null;
    if (!section.investmentStartDate || !section.investmentEndDate) {
      return section.balance * (section.investmentRate / 100);
    }
    const days = Math.max(0,
      (new Date(section.investmentEndDate).getTime() - new Date(section.investmentStartDate).getTime())
      / (1000 * 60 * 60 * 24)
    );
    return section.balance * (section.investmentRate / 100) * (days / 365);
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  }
}
