import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-refresh-info',
  templateUrl: './refresh-info.component.html',
  styles: [`
    ion-refresher {
      z-index: 102;
    }

    .refresh-info-text {
      min-height: 34px;
      padding: 7px 12px;
      background: #ffffff;
      border-bottom: 1px solid rgba(15, 23, 42, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      color: #475569;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
    }

    .refresh-info-text ion-icon {
      color: #22c55e;
      font-size: 17px;
    }

    .refresh-info-text ion-text {
      line-height: 1.2;
    }

    @media (prefers-color-scheme: dark) {
      .refresh-info-text {
        background: #1e293b;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: #cbd5e1;
      }

      .refresh-info-text ion-icon {
        color: #4ade80;
      }
    }
  `],
})
export class RefreshInfoComponent {

  @Output() onRefresh: EventEmitter<any> = new EventEmitter();
  @Input() removeItem: string = '';

  constructor() { }

  doRefresh(event: any) {
    if (this.removeItem === 'noClean') {
      this.onRefresh.emit();
      setTimeout(() => {
        event.target.complete();
      }, 1500);
      return;
    }

    if (this.removeItem === '') {
      sessionStorage.clear();
      this.onRefresh.emit();
      setTimeout(() => {
        event.target.complete();
      }, 1500);
      return;
    }

    switch (this.removeItem) {
      case 'cg_tipo_permiso':
      case 'cg_feriado':
      case 'lista-empleados':
        sessionStorage.removeItem(this.removeItem);
        break;

      default:
        sessionStorage.clear();
        break;
    }

    this.onRefresh.emit();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}