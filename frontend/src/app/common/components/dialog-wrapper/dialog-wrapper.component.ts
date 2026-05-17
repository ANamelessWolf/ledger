import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { DialogButton } from '@config/enums';
import { DialogModule } from '@angular/cdk/dialog';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogData } from '@common/types/DialogData';
import { CommonModule } from '@angular/common';
import { BTN } from '@config/messages';

@Component({
  selector: 'app-dialog-wrapper',
  standalone: true,
  imports: [CommonModule, DialogModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialog-wrapper.component.html',
  styleUrl: './dialog-wrapper.component.scss',
})
export class DialogWrapperComponent implements OnInit, AfterViewInit {
  @ViewChild('content', { read: ViewContainerRef, static: true })
  content!: ViewContainerRef;

  constructor(
    public dialogRef: MatDialogRef<DialogWrapperComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.loadComponent();
    this.cdr.detectChanges();
  }

  get hasClearButton(): boolean {
    return this.dialogData.buttons.includes(DialogButton.CLEAR);
  }

  get actionButtons(): DialogButton[] {
    return this.dialogData.buttons.filter((b) => b !== DialogButton.CLEAR);
  }

  onClear(): void {
    this.dialogData.onClear?.();
  }

  onButtonClick(button: DialogButton): void {
    if (this.dialogData.validate(this.dialogData.validationData)) {
      this.dialogRef.close({ data: this.dialogData.data, button });
    }
  }

  onBackdropClick(): void {
    this.dialogRef.close();
  }

  private loadComponent(): void {
    const componentRef: any = this.content.createComponent(this.dialogData.component);
    componentRef.instance.data = this.dialogData.data;
  }

  getButtonHeader(button: DialogButton): string {
    return (BTN as Record<string, string>)[button] ?? button;
  }

  getButtonStyle(button: DialogButton): string {
    const primary: DialogButton[] = [
      DialogButton.OK, DialogButton.SUBMIT, DialogButton.YES,
      DialogButton.APPLY, DialogButton.SAVE,
    ];
    return primary.includes(button) ? 'btn-primary' : 'btn-secondary';
  }
}
