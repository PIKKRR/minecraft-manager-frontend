import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<{message: string, type: 'success' | 'error'} | null>(null);
  notification$ = this.notificationSubject.asObservable();

  showSuccess(message: string): void {
    this.notificationSubject.next({ message, type: 'success' });
    this.clearAfterDelay();
  }

  showError(message: string): void {
    this.notificationSubject.next({ message, type: 'error' });
    this.clearAfterDelay();
  }

  private clearAfterDelay(delay = 5000): void {
    setTimeout(() => {
      this.notificationSubject.next(null);
    }, delay);
  }
}
