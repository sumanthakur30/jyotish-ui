import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Lang, TRANSLATIONS } from './translations';

export type { Lang };

const STORAGE_KEY = 'sj.lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly langSubject: BehaviorSubject<Lang>;
  readonly lang$;

  constructor() {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as
      | Lang
      | null;
    const initial: Lang = saved === 'en' || saved === 'hi' ? saved : 'hi';
    this.langSubject = new BehaviorSubject<Lang>(initial);
    this.lang$ = this.langSubject.asObservable();
    this.applyDocumentLang(initial);
  }

  get lang(): Lang {
    return this.langSubject.value;
  }

  setLang(lang: Lang): void {
    if (lang !== 'hi' && lang !== 'en') {
      return;
    }
    this.langSubject.next(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore quota / private mode */
    }
    this.applyDocumentLang(lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const table = TRANSLATIONS[this.lang] || TRANSLATIONS.hi;
    let text = table[key] ?? TRANSLATIONS.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      }
    }
    return text;
  }

  private applyDocumentLang(lang: Lang): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    }
  }
}
