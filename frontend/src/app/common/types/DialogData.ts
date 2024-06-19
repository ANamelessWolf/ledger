import { ComponentType } from '@angular/cdk/portal';
import { DialogButton } from '@config/enums';

export interface DialogData {
  header: string;
  component: ComponentType<unknown>;
  validationData: any;
  data: any;
  buttons: DialogButton[];
  validate: (data: any) => boolean;
}
