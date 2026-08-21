import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from './language.service';

/** Impure so UI refreshes when language toggles. */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private readonly language: LanguageService) {}

  transform(key: string, params?: Record<string, string | number>): string {
    return this.language.t(key, params);
  }
}
