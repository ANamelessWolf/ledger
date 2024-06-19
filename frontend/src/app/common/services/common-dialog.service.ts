import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogButton } from '@config/enums';

@Injectable({
  providedIn: 'root',
})
export class CommonDialogService {
  constructor(private dialog: MatDialog) {}

  openDialog(
    header: string,
    component: ComponentType<unknown>,
    data: any,
    buttons: DialogButton[],
    size: 'small' | 'medium' | 'large',
    validate: () => boolean
  ) {
    let width: string;
    switch (size) {
      case 'small':
        width = '300px';
        break;
      case 'medium':
        width = '600px';
        break;
      case 'large':
        width = '900px';
        break;
      default:
        width = '600px';
    }

    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      width,
      data: {
        header,
        component,
        data,
        buttons,
        validate,
      },
    });

    return dialogRef.afterClosed();
  }
}
