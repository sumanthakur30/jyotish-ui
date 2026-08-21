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

  areaStatusLine(a: SimpleLifeAreaCard): string {
    if (this.language.lang === 'hi') {
      return a.statusLineHi || this.statusLabel(a.status);
    }
    return a.statusLineEn || this.statusLabel(a.status);
  }

  areaFocus(a: SimpleLifeAreaCard): string | null {
    if (this.language.lang === 'hi') {
      return a.focusSummaryHi || null;
    }
    return a.focusSummaryEn || null;
  }

  areaParagraphs(a: SimpleLifeAreaCard): string[] {
    if (this.language.lang === 'hi') {
      return a.summaryParagraphsHi || [];
    }
    return a.summaryParagraphsEn || [];
  }

  areaPlanets(a: SimpleLifeAreaCard): string[] {
    if (this.language.lang === 'hi') {
      return a.relevantPlanetLinesHi || [];
    }
    return a.relevantPlanetLinesEn || [];
  }

  upcomingLabel(u: SimpleUpcomingItem): string {
    return this.language.lang === 'hi' ? u.labelHi : u.labelEn;
  }

  upcomingPlacement(u: SimpleUpcomingItem): string | null {
    if (this.language.lang === 'hi') {
      return u.placementLineHi || null;
    }
    return u.placementLineEn || null;
  }

  upcomingGloss(u: SimpleUpcomingItem): string | null {
    if (this.language.lang === 'hi') {
      return u.glossHi || null;
    }
    return u.glossEn || null;
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
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      try {
        return iso.slice(0, 10);
      } catch {
        return iso;
      }
    }
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
    const level = p.antarLordCode ? 'ANTAR' : 'MAHA';
    this.fetchUnderstand(level, p.mahaLordCode, p.antarLordCode, p);
  }

  openUnderstandUpcoming(u: SimpleUpcomingItem): void {
    if (!this.kundaliId || !u) {
      return;
    }
    const level = (u.levelCode || 'ANTAR').toUpperCase();
    const maha = u.mahaLordCode || (level === 'MAHA' ? u.lordCode : null);
    const antar =
      level === 'MAHA' ? null : u.lordCode || null;
    this.fetchUnderstand(level, maha, antar, null);
  }

  private fetchUnderstand(
    level: string,
    maha: string | null | undefined,
    antar: string | null | undefined,
    fallback: SimpleCurrentLifePeriod | null
  ): void {
    if (!this.kundaliId) {
      return;
    }
    this.understandBusy = true;
    this.understand = null;
    this.api.getSimplePeriod(this.kundaliId, level, maha || undefined, antar || undefined).subscribe({
      next: (res) => {
        this.understand = res;
        this.understandBusy = false;
      },
      error: () => {
        this.understandBusy = false;
        if (fallback && this.overview) {
          this.understand = {
            kundaliId: this.kundaliId!,
            calculationNotAvailable: false,
            levelCode: level,
            mahaLordCode: fallback.mahaLordCode,
            mahaLordName: fallback.mahaLordName,
            antarLordCode: fallback.antarLordCode,
            antarLordName: fallback.antarLordName,
            startAt: fallback.startAt,
            endAt: fallback.endAt,
            explanation: fallback.explanation,
            generalDisclaimerEn: this.overview.generalDisclaimerEn,
            generalDisclaimerHi: this.overview.generalDisclaimerHi,
          };
        }
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
