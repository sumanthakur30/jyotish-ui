import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  SimpleCurrentLifePeriod,
  SimpleExplainedBlock,
  SimpleGlanceCard,
  SimpleLifeAreaCard,
  SimpleOverviewResponse,
  SimplePeriodExplainResponse,
  SimpleUpcomingItem,
  JyotishApiService,
} from '../core/jyotish-api.service';
import { LanguageService } from '../core/i18n/language.service';

@Component({
  selector: 'app-simple-kundali-home',
  templateUrl: './simple-kundali-home.component.html',
  styleUrls: ['./simple-kundali-home.component.scss'],
})
export class SimpleKundaliHomeComponent implements OnChanges {
  @Input() kundaliId: number | null = null;
  @Output() openLifeArea = new EventEmitter<string>();
  @Output() openDasha = new EventEmitter<void>();

  overview: SimpleOverviewResponse | null = null;
  busy = false;
  error = '';
  whyOpen = false;
  understand: SimplePeriodExplainResponse | null = null;
  understandBusy = false;

  constructor(
    private readonly api: JyotishApiService,
    readonly language: LanguageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['kundaliId'] && this.kundaliId) {
      this.load();
    }
  }

  load(): void {
    if (!this.kundaliId) {
      return;
    }
    this.busy = true;
    this.error = '';
    this.api.getSimpleOverview(this.kundaliId).subscribe({
      next: (o) => {
        this.overview = o;
        this.busy = false;
      },
      error: (err) => {
        this.busy = false;
        this.error = err?.error?.message || 'Could not load simple overview.';
      },
    });
  }

  glanceValue(card: SimpleGlanceCard | null | undefined): string {
    if (!card?.available) {
      return this.language.t('simple.notAvailable');
    }
    return this.language.lang === 'hi'
      ? card.valueHi || card.valueEn || '—'
      : card.valueEn || card.valueHi || '—';
  }

  whatIsThis(card: SimpleGlanceCard | null | undefined): string {
    if (!card) {
      return '';
    }
    return this.language.lang === 'hi' ? card.whatIsThisHi : card.whatIsThisEn;
  }

  periodTitle(p: SimpleCurrentLifePeriod): string {
    return this.language.lang === 'hi' ? p.titleHi : p.titleEn;
  }

  paragraphs(block: SimpleExplainedBlock | null | undefined): string[] {
    if (!block) {
      return [];
    }
    return this.language.lang === 'hi' ? block.paragraphsHi : block.paragraphsEn;
  }

  areaLabel(a: SimpleLifeAreaCard): string {
    return this.language.lang === 'hi' ? a.labelHi : a.labelEn;
  }

  upcomingLabel(u: SimpleUpcomingItem): string {
    return this.language.lang === 'hi' ? u.labelHi : u.labelEn;
  }

  statusLabel(status: string): string {
    const key = `life.status${this.toStatusKey(status)}`;
    const t = this.language.t(key);
    return t === key ? status : t;
  }

  private toStatusKey(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'NOT_STARTED') return 'NotStarted';
    if (s === 'IN_PROGRESS') return 'InProgress';
    if (s === 'COMPLETED') return 'Completed';
    return status;
  }

  fmtWhen(iso: string | null | undefined): string {
    if (!iso) {
      return '—';
    }
    try {
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return iso.slice(0, 10);
    }
  }

  goLife(category: string): void {
    this.openLifeArea.emit(category);
  }

  goDasha(): void {
    this.openDasha.emit();
  }

  openUnderstandCurrent(): void {
    const p = this.overview?.currentLifePeriod;
    if (!this.kundaliId || !p) {
      return;
    }
    this.understandBusy = true;
    this.understand = null;
    const level = p.antarLordCode ? 'ANTAR' : 'MAHA';
    this.api
      .getSimplePeriod(this.kundaliId, level, p.mahaLordCode, p.antarLordCode)
      .subscribe({
        next: (res) => {
          this.understand = res;
          this.understandBusy = false;
        },
        error: () => {
          this.understandBusy = false;
          this.understand = {
            kundaliId: this.kundaliId!,
            calculationNotAvailable: false,
            levelCode: level,
            mahaLordCode: p.mahaLordCode,
            mahaLordName: p.mahaLordName,
            antarLordCode: p.antarLordCode,
            antarLordName: p.antarLordName,
            startAt: p.startAt,
            endAt: p.endAt,
            explanation: p.explanation,
            generalDisclaimerEn: this.overview!.generalDisclaimerEn,
            generalDisclaimerHi: this.overview!.generalDisclaimerHi,
          };
        },
      });
  }

  closeUnderstand(): void {
    this.understand = null;
  }

  disclaimer(): string {
    if (!this.overview) {
      return '';
    }
    return this.language.lang === 'hi'
      ? this.overview.generalDisclaimerHi
      : this.overview.generalDisclaimerEn;
  }

  showsHealth(areas: SimpleLifeAreaCard[] | null | undefined): boolean {
    return !!areas?.some((a) => (a.category || '').toUpperCase() === 'HEALTH');
  }
}
