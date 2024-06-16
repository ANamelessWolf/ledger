import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { APP_SETTINGS } from '@config/constants';
import { Observable, throwError } from 'rxjs';

export class LedgerHttpInterceptor implements HttpInterceptor {
  constructor() // private notificationsService: NotificationsService,
  {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const updReq = req.clone({
      setHeaders: {
        owner: `${APP_SETTINGS.OWNER_EMAIL}`,
      },
    });

    return next.handle(updReq);
  }
}
