import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Delete item</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete <strong>{{ data.name }}</strong>?</p>
      <p class="warn">This action cannot be undone. Items in use cannot be deleted.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" (click)="confirm()">Delete</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .warn { font-size: 13px; color: var(--color-danger, #b91c1c); margin-top: 4px; }
    p { margin: 0 0 4px; }
  `],
})
export class ConfirmDeleteDialogComponent {
  constructor(
    private ref: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}

  confirm(): void { this.ref.close(true); }
}
