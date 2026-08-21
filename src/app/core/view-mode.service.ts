import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ViewMode = 'simple' | 'expert';

const STORAGE_KEY = 'sj.viewMode';

@Injectable({ providedIn: 'root' })
export class ViewModeService {
  private readonly modeSubject: BehaviorSubject<ViewMode>;
  readonly mode$;

  constructor() {
    const saved =
      typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const initial: ViewMode = saved === 'expert' ? 'expert' : 'simple';
    this.modeSubject = new BehaviorSubject<ViewMode>(initial);
    this.mode$ = this.modeSubject.asObservable();
  }

  get mode(): ViewMode {
    return this.modeSubject.value;
  }

  get isSimple(): boolean {
    return this.mode === 'simple';
  }

  get isExpert(): boolean {
    return this.mode === 'expert';
  }

  setMode(mode: ViewMode): void {
    if (mode !== 'simple' && mode !== 'expert') {
      return;
    }
    this.modeSubject.next(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore quota / private mode */
    }
  }

  toggle(): void {
    this.setMode(this.isSimple ? 'expert' : 'simple');
  }
}
