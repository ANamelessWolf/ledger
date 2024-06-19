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
import {
  DialogModule,
} from '@angular/cdk/dialog';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DialogData } from '@common/types/DialogData';
import { CommonModule } from '@angular/common';
import { BTN } from '@config/messages';

@Component({
  selector: 'app-dialog-wrapper',
  standalone: true,
  imports: [CommonModule, DialogModule, MatButtonModule],
  templateUrl: './dialog-wrapper.component.html',
  styleUrl: './dialog-wrapper.component.scss',
})
export class DialogWrapperComponent implements OnInit, AfterViewInit {
  clickedButton = DialogButton;
  @ViewChild('content', { read: ViewContainerRef, static: true })
  content!: ViewContainerRef;

  constructor(
    public dialogRef: MatDialogRef<DialogWrapperComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.loadComponent();
    this.cdr.detectChanges();
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
    const componentFactory: any = this.content.createComponent(
      this.dialogData.component
    );
    componentFactory.instance.data = this.dialogData.data;
  }

  getButtonHeader(button: DialogButton): string {
    let header: string = '';
    switch (button) {
      case DialogButton.CANCEL:
        header = BTN.CANCEL;
        break;
      case DialogButton.NO:
        header = BTN.NO;
        break;
      case DialogButton.OK:
        header = BTN.OK;
        break;
      case DialogButton.SUBMIT:
        header = BTN.SUBMIT;
        break;
      case DialogButton.YES:
        header = BTN.YES;
        break;
    }
    return header;
  }

  getButtonStyle(button: DialogButton): string {
    let classname: string = 'other-btn';
    switch (button) {
      case DialogButton.CANCEL:
        classname = 'secondary-btn';
        break;
      case DialogButton.NO:
        classname = 'secondary-btn';
        break;
      case DialogButton.OK:
        classname = 'primary-btn';
        break;
      case DialogButton.SUBMIT:
        classname = 'primary-btn';
        break;
      case DialogButton.YES:
        classname = 'primary-btn';
        break;
    }
    return classname;
  }

}
