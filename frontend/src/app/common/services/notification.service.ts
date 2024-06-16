import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationTypes } from '@common/common-interfaces';
import { ERROR_MSG } from '@config/messages';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private message = new Subject<string>();
  private show = new Subject<boolean>();
  private type = new Subject<NotificationTypes>();

  message$ = this.message.asObservable();
  show$ = this.show.asObservable();
  type$ = this.type.asObservable();

  constructor(private snack: MatSnackBar) {}

  getNotifications() {
    return {
      message: this.message,
      show: this.show,
      type: this.type,
    };
  }

  toggleNotification(show: boolean, message: string) {
    this.message.next('');
    this.show.next(show);
    this.type.next('info');
  }

  showNotification(message: string, type: NotificationTypes) {
    this.message.next(message);
    this.show.next(true);
    this.type.next(type);
    this.snack.open(message, 'Close', {
      duration: 10 * 1000, // 10 seconds
    });
  }

  showError(err: HttpErrorResponse | null, message = '') {
    if (!err && !message.length) return;
    let errorMessage =
      err?.status === 0 ? ERROR_MSG.UNKNOWN_ERROR : err?.error.message;
    errorMessage = !message.length ? errorMessage : message;
    this.snack.open(errorMessage, 'Close', {
      duration: 10 * 1000, // 10 seconds
    });
  }
}
