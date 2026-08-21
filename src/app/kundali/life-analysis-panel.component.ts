import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  JyotishApiService,
  LifeAnalysisDashboard,
  LifeAnalysisDetail,
  LifeCategorySummary,
  LifeConsultationItem,
  LifeHistoryItem,
  LifePeriodDto,
  LifeSearchHit,
} from '../core/jyotish-api.service';
import { LanguageService } from '../core/i18n/language.service';

/** Topic-specific section keys (stored in sections_json). */
const SECTION_KEYS: Record<string, { key: string; en: string; hi: string }[]> = {
  CAREER: [
    { key: 'currentSituation', en: 'Current Career Situation', hi: 'वर्तमान करियर स्थिति' },
    { key: 'strengths', en: 'Career Strengths', hi: 'करियर की मजबूती' },
    { key: 'challenges', en: 'Career Challenges', hi: 'करियर की चुनौतियां' },
    { key: 'suitableAreas', en: 'Suitable Career Areas', hi: 'उपयुक्त करियर क्षेत्र' },
    { key: 'jobChange', en: 'Job Change Analysis', hi: 'नौकरी परिवर्तन' },
    { key: 'promotion', en: 'Promotion Analysis', hi: 'पदोन्नति' },
    { key: 'govtJob', en: 'Government Job', hi: 'सरकारी नौकरी' },
    { key: 'privateJob', en: 'Private Job', hi: 'निजी नौकरी' },
    { key: 'foreignJob', en: 'Foreign Job Opportunity', hi: 'विदेश में नौकरी' },
  ],
  JOB: [
    { key: 'currentSituation', en: 'Current Job Situation', hi: 'वर्तमान नौकरी स्थिति' },
    { key: 'strengths', en: 'Strengths', hi: 'मजबूती' },
    { key: 'challenges', en: 'Challenges', hi: 'चुनौतियां' },
    { key: 'jobChange', en: 'Job Change', hi: 'नौकरी परिवर्तन' },
    { key: 'promotion', en: 'Promotion', hi: 'पदोन्नति' },
  ],
  BUSINESS: [
    { key: 'potential', en: 'Business Potential', hi: 'व्यवसाय की संभावना' },
    { key: 'suitableAreas', en: 'Suitable Business Areas', hi: 'उपयुक्त व्यवसाय क्षेत्र' },
    { key: 'partnership', en: 'Partnership', hi: 'साझेदारी' },
    { key: 'independent', en: 'Independent Business', hi: 'स्वतंत्र व्यवसाय' },
    { key: 'growth', en: 'Business Growth', hi: 'व्यवसाय वृद्धि' },
    { key: 'risks', en: 'Risk Areas', hi: 'जोखिम वाले क्षेत्र' },
    { key: 'expansion', en: 'Expansion', hi: 'विस्तार' },
    { key: 'investment', en: 'Investment Considerations', hi: 'निवेश संबंधी टिप्पणी' },
  ],
  FINANCE: [
    { key: 'income', en: 'Income Potential', hi: 'आय की संभावना' },
    { key: 'savings', en: 'Savings', hi: 'बचत' },
    { key: 'wealth', en: 'Wealth Creation', hi: 'धन सृजन' },
    { key: 'h2', en: '2nd House Analysis', hi: 'द्वितीय भाव' },
    { key: 'h11', en: '11th House Analysis', hi: 'एकादश भाव' },
    { key: 'dhanaYogas', en: 'Dhana Yogas', hi: 'धन योग' },
    { key: 'challenges', en: 'Financial Challenges', hi: 'वित्तीय चुनौतियां' },
    { key: 'assets', en: 'Property/Asset Considerations', hi: 'संपत्ति संबंधी' },
  ],
  MARRIAGE: [
    { key: 'indicators', en: 'Marriage Indicators', hi: 'विवाह संकेत' },
    { key: 'timing', en: 'Marriage Timing Notes', hi: 'समय संबंधी टिप्पणी' },
    { key: 'strengths', en: 'Relationship Strengths', hi: 'संबंध मजबूती' },
    { key: 'challenges', en: 'Relationship Challenges', hi: 'संबंध चुनौतियां' },
    { key: 'spouse', en: 'Spouse Characteristics', hi: 'जीवनसाथी विशेषताएं' },
    { key: 'remedies', en: 'Traditional Remedies', hi: 'पारंपरिक उपाय' },
  ],
  FAMILY: [
    { key: 'parents', en: 'Parents', hi: 'माता-पिता' },
    { key: 'father', en: 'Father', hi: 'पिता' },
    { key: 'mother', en: 'Mother', hi: 'माता' },
    { key: 'siblings', en: 'Siblings', hi: 'भाई-बहन' },
    { key: 'spouse', en: 'Spouse', hi: 'जीवनसाथी' },
    { key: 'children', en: 'Children', hi: 'संतान' },
    { key: 'familyRel', en: 'Family Relationship', hi: 'पारिवारिक संबंध' },
  ],
  CHILDREN: [
    { key: 'indicators', en: 'Children-related indicators', hi: 'संतान संबंधी संकेत' },
    { key: 'timing', en: 'Timing observations', hi: 'समय संबंधी अवलोकन' },
    { key: 'relationship', en: 'Relationship with children', hi: 'संतान से संबंध' },
    { key: 'education', en: 'Education of children', hi: 'संतान की शिक्षा' },
  ],
  EDUCATION: [
    { key: 'strength', en: 'Education Strength', hi: 'शिक्षा की मजबूती' },
    { key: 'areas', en: 'Suitable Study Areas', hi: 'उपयुक्त अध्ययन क्षेत्र' },
    { key: 'higher', en: 'Higher Education', hi: 'उच्च शिक्षा' },
    { key: 'exams', en: 'Competitive Exams', hi: 'प्रतियोगी परीक्षा' },
    { key: 'foreign', en: 'Foreign Education', hi: 'विदेशी शिक्षा' },
  ],
  PROPERTY: [
    { key: 'purchase', en: 'Property Purchase', hi: 'संपत्ति खरीद' },
    { key: 'home', en: 'Home', hi: 'घर' },
    { key: 'land', en: 'Land', hi: 'भूमि' },
    { key: 'vehicle', en: 'Vehicle', hi: 'वाहन' },
    { key: 'assets', en: 'Asset Creation', hi: 'संपत्ति निर्माण' },
  ],
  FOREIGN: [
    { key: 'travel', en: 'Foreign Travel', hi: 'विदेश यात्रा' },
    { key: 'job', en: 'Foreign Job', hi: 'विदेश नौकरी' },
    { key: 'education', en: 'Foreign Education', hi: 'विदेश शिक्षा' },
    { key: 'business', en: 'Foreign Business', hi: 'विदेश व्यवसाय' },
    { key: 'settlement', en: 'Settlement', hi: 'प्रवास / स्थायी निवास' },
  ],
  SPIRITUALITY: [
    { key: 'inclination', en: 'Spiritual Inclination', hi: 'आध्यात्मिक रुझान' },
    { key: 'meditation', en: 'Meditation', hi: 'ध्यान' },
    { key: 'practice', en: 'Religious Practice', hi: 'धार्मिक अभ्यास' },
    { key: 'guru', en: 'Guru/Teacher', hi: 'गुरु' },
    { key: 'pilgrimage', en: 'Pilgrimage', hi: 'तीर्थ यात्रा' },
  ],
  HEALTH: [
    { key: 'traditional', en: 'Traditional Jyotish Indicators', hi: 'पारंपरिक ज्योतिष संकेत' },
    { key: 'strengthWeak', en: 'Strength/Weakness Indicators', hi: 'बल / दुर्बलता' },
  ],
};

@Component({
  selector: 'app-life-analysis-panel',
  templateUrl: './life-analysis-panel.component.html',
  styleUrls: ['./life-analysis-panel.component.scss'],
})
export class LifeAnalysisPanelComponent implements OnChanges {
  @Input() kundaliId!: number;

  dashboard: LifeAnalysisDashboard | null = null;
  selected: string | null = null;
  detail: LifeAnalysisDetail | null = null;
  periods: LifePeriodDto[] = [];
  history: LifeHistoryItem[] = [];
  consultations: LifeConsultationItem[] = [];
  searchHits: LifeSearchHit[] = [];
  searchQ = '';
  busy = false;
  saveBusy = false;
  error = '';
  flash = '';
  showHistory = false;
  showConsultations = false;

  draftStatus = 'NOT_STARTED';
  pastNotes = '';
  presentNotes = '';
  futureNotes = '';
  importantPeriodsNotes = '';
  advice = '';
  jyotishNotes = '';
  sections: Record<string, string> = {};
  includeInReport = true;
  recordConsultation = false;

  periodForm = {
    fromDate: '',
    toDate: '',
    topic: '',
    observation: '',
    calculationBasis: '',
    status: 'PLANNED',
  };
  editingPeriodId: number | null = null;

  constructor(
    private readonly api: JyotishApiService,
    readonly language: LanguageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['kundaliId'] && this.kundaliId) {
      this.loadDashboard();
      this.selected = null;
      this.detail = null;
    }
  }

  loadDashboard(): void {
    this.busy = true;
    this.error = '';
    this.api.getLifeAnalysisDashboard(this.kundaliId).subscribe({
      next: (d) => {
        this.dashboard = d;
        this.busy = false;
      },
      error: (err) => {
        this.busy = false;
        this.error = err?.error?.message || 'Could not load Life Analysis.';
      },
    });
  }

  label(c: LifeCategorySummary): string {
    return this.language.lang === 'hi' ? c.labelHi : c.labelEn;
  }

  categoryTitle(): string {
    const c = this.dashboard?.categories?.find((x) => x.category === this.selected);
    if (c) {
      return this.label(c);
    }
    return this.selected || '';
  }

  statusLabel(status: string): string {
    const s = (status || 'NOT_STARTED').toUpperCase();
    if (s === 'COMPLETED') {
      return this.language.t('life.statusCompleted');
    }
    if (s === 'IN_PROGRESS') {
      return this.language.t('life.statusInProgress');
    }
    return this.language.t('life.statusNotStarted');
  }

  openCategory(code: string): void {
    this.selected = code;
    this.showHistory = false;
    this.busy = true;
    this.error = '';
    this.api.getLifeAnalysis(this.kundaliId, code).subscribe({
      next: (d) => {
        this.applyDetail(d);
        this.busy = false;
        this.loadPeriods(code);
      },
      error: (err) => {
        this.busy = false;
        this.error = err?.error?.message || 'Could not load category.';
      },
    });
  }

  backToDashboard(): void {
    this.selected = null;
    this.detail = null;
    this.loadDashboard();
  }

  sectionDefs(): { key: string; en: string; hi: string }[] {
    if (!this.selected) {
      return [];
    }
    return SECTION_KEYS[this.selected] || [];
  }

  sectionLabel(def: { en: string; hi: string }): string {
    return this.language.lang === 'hi' ? def.hi : def.en;
  }

  applyTemplate(): void {
    const lines = [
      'Current Situation:',
      '',
      'Strengths:',
      '',
      'Challenges:',
      '',
      'Opportunities:',
      '',
      'Important Periods:',
      '',
      'Advice:',
      '',
      'Final Observation:',
    ];
    if (!this.presentNotes?.trim()) {
      this.presentNotes = lines.join('\n');
    } else {
      this.presentNotes = this.presentNotes + '\n\n' + lines.join('\n');
    }
  }

  save(): void {
    if (!this.selected) {
      return;
    }
    this.saveBusy = true;
    this.flash = '';
    this.api
      .upsertLifeAnalysis(this.kundaliId, this.selected, {
        status: this.draftStatus,
        pastNotes: this.pastNotes,
        presentNotes: this.presentNotes,
        futureNotes: this.futureNotes,
        importantPeriodsNotes: this.importantPeriodsNotes,
        advice: this.advice,
        jyotishNotes: this.jyotishNotes,
        sections: this.sections,
        includeInReport: this.includeInReport,
        recordConsultation: this.recordConsultation,
        consultationObservation: this.presentNotes,
        consultationAdvice: this.advice,
      })
      .subscribe({
        next: (d) => {
          this.applyDetail(d);
          this.saveBusy = false;
          this.recordConsultation = false;
          this.flash = this.language.t('life.saved');
          this.loadDashboard();
        },
        error: (err) => {
          this.saveBusy = false;
          this.error = err?.error?.message || 'Save failed.';
        },
      });
  }

  loadPeriods(category: string): void {
    this.api.listLifePeriods(this.kundaliId, category).subscribe({
      next: (res) => {
        this.periods = res.periods || [];
      },
    });
  }

  savePeriod(): void {
    if (!this.selected || !this.periodForm.topic.trim()) {
      return;
    }
    const body = {
      category: this.selected,
      fromDate: this.periodForm.fromDate || null,
      toDate: this.periodForm.toDate || null,
      topic: this.periodForm.topic.trim(),
      observation: this.periodForm.observation || null,
      calculationBasis: this.periodForm.calculationBasis || null,
      status: this.periodForm.status || 'PLANNED',
      sortOrder: this.periods.length,
    };
    const req =
      this.editingPeriodId != null
        ? this.api.updateLifePeriod(this.kundaliId, this.editingPeriodId, body)
        : this.api.createLifePeriod(this.kundaliId, body);
    req.subscribe({
      next: () => {
        this.resetPeriodForm();
        this.loadPeriods(this.selected!);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Period save failed.';
      },
    });
  }

  editPeriod(p: LifePeriodDto): void {
    this.editingPeriodId = p.id;
    this.periodForm = {
      fromDate: p.fromDate || '',
      toDate: p.toDate || '',
      topic: p.topic,
      observation: p.observation || '',
      calculationBasis: p.calculationBasis || '',
      status: p.status || 'PLANNED',
    };
  }

  deletePeriod(p: LifePeriodDto): void {
    this.api.deleteLifePeriod(this.kundaliId, p.id).subscribe({
      next: () => this.loadPeriods(this.selected!),
    });
  }

  resetPeriodForm(): void {
    this.editingPeriodId = null;
    this.periodForm = {
      fromDate: '',
      toDate: '',
      topic: '',
      observation: '',
      calculationBasis: '',
      status: 'PLANNED',
    };
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory && this.selected) {
      this.api.getLifeHistory(this.kundaliId, this.selected).subscribe({
        next: (h) => {
          this.history = h.items || [];
        },
      });
    }
  }

  toggleConsultations(): void {
    this.showConsultations = !this.showConsultations;
    if (this.showConsultations) {
      this.api.getLifeConsultations(this.kundaliId).subscribe({
        next: (c) => {
          this.consultations = c.items || [];
        },
      });
    }
  }

  runSearch(): void {
    if (!this.searchQ.trim()) {
      this.searchHits = [];
      return;
    }
    this.api.searchLifeAnalysis(this.kundaliId, this.searchQ.trim()).subscribe({
      next: (r) => {
        this.searchHits = r.hits || [];
      },
    });
  }

  openHit(hit: LifeSearchHit): void {
    this.openCategory(hit.category);
  }

  fmtWhen(iso: string | null | undefined): string {
    if (!iso) {
      return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private applyDetail(d: LifeAnalysisDetail): void {
    this.detail = d;
    this.draftStatus = d.status || 'NOT_STARTED';
    this.pastNotes = d.pastNotes || '';
    this.presentNotes = d.presentNotes || '';
    this.futureNotes = d.futureNotes || '';
    this.importantPeriodsNotes = d.importantPeriodsNotes || '';
    this.advice = d.advice || '';
    this.jyotishNotes = d.jyotishNotes || '';
    this.sections = { ...(d.sections || {}) };
    this.includeInReport = d.includeInReport !== false;
  }
}
