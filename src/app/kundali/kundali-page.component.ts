import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AiAskResponse,
  AiTopic,
  AshtakavargaResponse,
  ChartCatalogItem,
  DashaPeriodDto,
  DashaResponse,
  DoshaListResponse,
  JyotishApiService,
  KundaliResponse,
  PlanetDto,
  ShadbalaResponse,
  TransitResponse,
  VargaChartResponse,
  YogaCatalogItem,
  YogaDto,
  YogaListResponse,
} from '../core/jyotish-api.service';
import { EntitlementStateService } from '../core/entitlement-state.service';
import { LanguageService } from '../core/i18n/language.service';
import { planetFull, signFull, yogaCategoryLabel, yogaNameHi } from '../core/i18n/jyotish-labels';

@Component({
  selector: 'app-kundali-page',
  templateUrl: './kundali-page.component.html',
  styleUrls: ['./kundali-page.component.scss'],
})
export class KundaliPageComponent implements OnInit {
  kundali: KundaliResponse | null = null;
  tab:
    | 'overview'
    | 'planets'
    | 'houses'
    | 'charts'
    | 'dasha'
    | 'yogas'
    | 'doshas'
    | 'ashtakavarga'
    | 'shadbala'
    | 'transit'
    | 'reports'
    | 'ask' = 'overview';
  error = '';
  busy = false;

  chartCatalog: ChartCatalogItem[] = [];
  selectedVarga = 'D9';
  vargaChart: VargaChartResponse | null = null;
  chartBusy = false;
  chartError = '';

  dasha: DashaResponse | null = null;
  dashaBusy = false;
  dashaError = '';
  expandedMaha = new Set<string>();
  expandedAntar = new Set<string>();
  selectedPeriod: DashaPeriodDto | null = null;
  showInterpretation = false;

  yogas: YogaListResponse | null = null;
  yogaBusy = false;
  yogaError = '';
  yogaCategory: string | null = null;
  expandedYoga = new Set<string>();

  doshas: DoshaListResponse | null = null;
  doshaBusy = false;
  doshaError = '';
  expandedDosha = new Set<string>();

  transit: TransitResponse | null = null;
  transitBusy = false;
  transitError = '';
  transitDate = '';

  ashtakavarga: AshtakavargaResponse | null = null;
  ashtakaBusy = false;
  ashtakaError = '';

  shadbala: ShadbalaResponse | null = null;
  shadbalaBusy = false;
  shadbalaError = '';
  expandedShadbala = new Set<string>();

  reportBusy = false;
  reportMessage = '';
  reportError = '';

  aiTopics: { code: AiTopic; label: string }[] = [
    { code: 'general', label: 'General' },
    { code: 'career', label: 'Career' },
    { code: 'marriage', label: 'Marriage' },
    { code: 'finance', label: 'Finance' },
    { code: 'health', label: 'Health' },
    { code: 'education', label: 'Education' },
    { code: 'family', label: 'Family' },
    { code: 'spirituality', label: 'Spirituality' },
  ];
  aiTopic: AiTopic = 'general';
  aiQuestion = '';
  aiBusy = false;
  aiError = '';
  aiReply: AiAskResponse | null = null;
  aiHistory: AiAskResponse[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: JyotishApiService,
    readonly entitlements: EntitlementStateService,
    readonly language: LanguageService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.error = 'Missing kundali id.';
      return;
    }
    this.busy = true;
    this.api.getKundali(id).subscribe({
      next: (k) => {
        this.kundali = k;
        this.busy = false;
      },
      error: (err) => {
        this.busy = false;
        this.error = err?.error?.message || 'Could not load kundali.';
      },
    });
  }

  openCharts(): void {
    this.tab = 'charts';
    if (!this.kundali) {
      return;
    }
    if (!this.chartCatalog.length) {
      this.loadCatalog();
    } else if (!this.vargaChart) {
      this.loadVarga(this.selectedVarga);
    }
  }

  openDasha(): void {
    this.tab = 'dasha';
    if (!this.kundali) {
      return;
    }
    if (!this.dasha) {
      this.loadDasha();
    }
  }

  openYogas(): void {
    this.tab = 'yogas';
    if (!this.kundali) {
      return;
    }
    if (!this.yogas) {
      this.loadYogas();
    }
  }

  openDoshas(): void {
    this.tab = 'doshas';
    if (!this.kundali) {
      return;
    }
    if (!this.doshas) {
      this.loadDoshas();
    }
  }

  openTransit(): void {
    this.tab = 'transit';
    if (!this.kundali) {
      return;
    }
    if (!this.transitDate) {
      this.transitDate = this.todayIso();
    }
    if (!this.transit) {
      this.loadTransit();
    }
  }

  openAshtakavarga(): void {
    this.tab = 'ashtakavarga';
    if (!this.kundali) {
      return;
    }
    if (!this.ashtakavarga) {
      this.loadAshtakavarga();
    }
  }

  openShadbala(): void {
    this.tab = 'shadbala';
    if (!this.kundali) {
      return;
    }
    if (!this.shadbala) {
      this.loadShadbala();
    }
  }

  openReports(): void {
    this.tab = 'reports';
    this.reportMessage = '';
    this.reportError = '';
  }

  openAsk(): void {
    this.tab = 'ask';
    this.aiError = '';
  }

  submitAsk(): void {
    if (!this.kundali) {
      return;
    }
    const q = (this.aiQuestion || '').trim();
    if (!q) {
      this.aiError = 'Enter a question.';
      return;
    }
    this.aiBusy = true;
    this.aiError = '';
    this.api
      .askAi({ kundaliId: this.kundali.id, question: q, topic: this.aiTopic })
      .subscribe({
        next: (res) => {
          this.aiReply = res;
          this.aiHistory = [res, ...this.aiHistory].slice(0, 8);
          this.aiBusy = false;
        },
        error: (err) => {
          this.aiBusy = false;
          this.aiReply = null;
          this.aiError =
            err?.error?.message || err?.error?.detail || 'Could not get AI answer.';
        },
      });
  }

  downloadBasicPdf(): void {
    this.downloadReport('BASIC_KUNDALI');
  }

  downloadDashaPdf(): void {
    this.downloadReport('DASHA_SUMMARY');
  }

  downloadTransitPdf(): void {
    this.downloadReport('TRANSIT');
  }

  private downloadReport(type: 'BASIC_KUNDALI' | 'DASHA_SUMMARY' | 'TRANSIT'): void {
    if (!this.kundali) {
      return;
    }
    this.reportBusy = true;
    this.reportError = '';
    this.reportMessage = '';
    this.api.createReport({ type, kundaliId: this.kundali.id }).subscribe({
      next: (meta) => {
        this.api.downloadReport(meta.id).subscribe({
          next: (blob) => {
            this.saveBlob(blob, `jyotish-${type.toLowerCase()}-${this.kundali!.id}.pdf`);
            this.reportBusy = false;
            this.reportMessage = `Downloaded ${meta.displayTitle} (${meta.fileSizeBytes} bytes).`;
          },
          error: (err) => {
            this.reportBusy = false;
            this.reportError = err?.error?.message || 'Could not download PDF.';
          },
        });
      },
      error: (err) => {
        this.reportBusy = false;
        this.reportError = err?.error?.message || 'Could not generate PDF.';
      },
    });
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  applyTransitDate(): void {
    this.transit = null;
    this.loadTransit();
  }

  selectYogaCategory(code: string | null): void {
    this.yogaCategory = code;
    this.yogas = null;
    this.loadYogas();
  }

  toggleYoga(code: string): void {
    if (this.expandedYoga.has(code)) {
      this.expandedYoga.delete(code);
    } else {
      this.expandedYoga.add(code);
    }
  }

  presentYogas(): YogaDto[] {
    return (this.yogas?.yogas || []).filter((y) => y.present);
  }

  absentImplemented(): YogaDto[] {
    return (this.yogas?.yogas || []).filter((y) => !y.present);
  }

  comingSoonCatalog(): YogaCatalogItem[] {
    return (this.yogas?.catalog || []).filter((c) => !c.implemented);
  }

  yogaFoundCount(): number {
    return this.presentYogas().length;
  }

  yogaStrongCount(): number {
    return this.presentYogas().filter((y) => (y.strengthCode || '').toUpperCase() === 'FULL').length;
  }

  yogaModerateCount(): number {
    return this.presentYogas().filter((y) => {
      const s = (y.strengthCode || '').toUpperCase();
      return s === 'MODERATE' || s === 'PARTIAL';
    }).length;
  }

  yogaAbsentCount(): number {
    return this.absentImplemented().length;
  }

  yogaTitle(yoga: { yogaCode: string; displayName: string }): string {
    if (this.language.lang === 'hi') {
      return yogaNameHi(yoga.yogaCode) || yoga.displayName;
    }
    return yoga.displayName;
  }

  yogaTitleSecondary(yoga: { yogaCode: string; displayName: string }): string {
    if (this.language.lang === 'hi') {
      return yoga.displayName;
    }
    return yogaNameHi(yoga.yogaCode);
  }

  yogaCatLabel(categoryCode: string): string {
    return yogaCategoryLabel(categoryCode, this.language.lang);
  }

  yogaStrengthLabel(code: string | null | undefined): string {
    const s = (code || '').toUpperCase();
    if (s === 'FULL') {
      return this.language.t('yoga.strength.full');
    }
    if (s === 'MODERATE') {
      return this.language.t('yoga.strength.moderate');
    }
    if (s === 'PARTIAL') {
      return this.language.t('yoga.strength.partial');
    }
    return this.language.t('yoga.strength.none');
  }

  yogaPlanetLabels(codes: string[]): string {
    if (!codes?.length) {
      return '—';
    }
    return codes.map((c) => planetFull(c, this.language.lang)).join(', ');
  }

  moonSignLabel(): string {
    const mo = this.planetOf('MOON');
    return mo ? this.signLabel(mo.signName) : '—';
  }

  moonNakshatraLabel(): string {
    const mo = this.planetOf('MOON');
    if (!mo) {
      return '—';
    }
    return `${mo.nakshatraName} ${this.language.t('kundali.pada')} ${mo.pada}`;
  }

  selectVarga(code: string, implemented: boolean): void {
    this.selectedVarga = code;
    this.vargaChart = null;
    this.chartError = '';
    if (!implemented) {
      this.chartError = `${code} is Coming Soon.`;
      return;
    }
    this.loadVarga(code);
  }

  toggleMaha(key: string): void {
    if (this.expandedMaha.has(key)) {
      this.expandedMaha.delete(key);
    } else {
      this.expandedMaha.add(key);
    }
  }

  toggleAntar(key: string): void {
    if (this.expandedAntar.has(key)) {
      this.expandedAntar.delete(key);
    } else {
      this.expandedAntar.add(key);
    }
  }

  periodKey(p: DashaPeriodDto): string {
    return `${p.level}-${p.lordCode}-${p.startAt}`;
  }

  selectPeriod(p: DashaPeriodDto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedPeriod = p;
    this.showInterpretation = true;
  }

  closeInterpretation(): void {
    this.showInterpretation = false;
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

  private loadCatalog(): void {
    if (!this.kundali) {
      return;
    }
    this.chartBusy = true;
    this.api.listCharts(this.kundali.id).subscribe({
      next: (res) => {
        this.chartCatalog = res.charts || [];
        this.chartBusy = false;
        const preferred =
          this.chartCatalog.find((c) => c.vargaCode === 'D9' && c.implemented) ||
          this.chartCatalog.find((c) => c.implemented);
        if (preferred) {
          this.selectVarga(preferred.vargaCode, true);
        }
      },
      error: (err) => {
        this.chartBusy = false;
        this.chartError = err?.error?.message || 'Could not load chart catalog.';
      },
    });
  }

  private loadVarga(code: string): void {
    if (!this.kundali) {
      return;
    }
    this.chartBusy = true;
    this.chartError = '';
    this.api.getChart(this.kundali.id, code).subscribe({
      next: (chart) => {
        this.vargaChart = chart;
        this.chartBusy = false;
      },
      error: (err) => {
        this.chartBusy = false;
        this.vargaChart = null;
        this.chartError = err?.error?.message || `Could not load ${code}.`;
      },
    });
  }

  private loadDasha(): void {
    if (!this.kundali) {
      return;
    }
    this.dashaBusy = true;
    this.dashaError = '';
    this.api.getDasha(this.kundali.id).subscribe({
      next: (d) => {
        this.dasha = d;
        this.dashaBusy = false;
        const cur = d.timeline.find((m) => m.current);
        if (cur) {
          this.expandedMaha.add(this.periodKey(cur));
          const antar = cur.children.find((a) => a.current);
          if (antar) {
            this.expandedAntar.add(this.periodKey(antar));
          }
        }
      },
      error: (err) => {
        this.dashaBusy = false;
        this.dasha = null;
        this.dashaError = err?.error?.message || 'Could not load dasha.';
      },
    });
  }

  private loadYogas(): void {
    if (!this.kundali) {
      return;
    }
    this.yogaBusy = true;
    this.yogaError = '';
    this.api.getYogas(this.kundali.id, this.yogaCategory || undefined).subscribe({
      next: (y) => {
        this.yogas = y;
        this.yogaBusy = false;
        for (const hit of y.yogas.filter((x) => x.present)) {
          this.expandedYoga.add(hit.yogaCode);
        }
      },
      error: (err) => {
        this.yogaBusy = false;
        this.yogas = null;
        this.yogaError = err?.error?.message || this.language.t('yoga.loadError');
      },
    });
  }

  private loadDoshas(): void {
    if (!this.kundali) {
      return;
    }
    this.doshaBusy = true;
    this.doshaError = '';
    this.api.getDoshas(this.kundali.id).subscribe({
      next: (d) => {
        this.doshas = d;
        this.doshaBusy = false;
        for (const hit of d.doshas.filter((x) => x.status === 'PRESENT' || x.status === 'CANCELLED')) {
          this.expandedDosha.add(hit.doshaCode);
        }
      },
      error: (err) => {
        this.doshaBusy = false;
        this.doshas = null;
        this.doshaError = err?.error?.message || this.language.t('dosha.loadError');
      },
    });
  }

  private loadTransit(): void {
    if (!this.kundali) {
      return;
    }
    this.transitBusy = true;
    this.transitError = '';
    this.api.getTransit(this.kundali.id, this.transitDate || undefined).subscribe({
      next: (t) => {
        this.transit = t;
        this.transitDate = t.transitDate;
        this.transitBusy = false;
      },
      error: (err) => {
        this.transitBusy = false;
        this.transit = null;
        this.transitError = err?.error?.message || 'Could not load transit.';
      },
    });
  }

  private loadAshtakavarga(): void {
    if (!this.kundali) {
      return;
    }
    this.ashtakaBusy = true;
    this.ashtakaError = '';
    this.api.getAshtakavarga(this.kundali.id).subscribe({
      next: (a) => {
        this.ashtakavarga = a;
        this.ashtakaBusy = false;
      },
      error: (err) => {
        this.ashtakaBusy = false;
        this.ashtakavarga = null;
        this.ashtakaError = err?.error?.message || 'Could not load Ashtakavarga.';
      },
    });
  }

  private loadShadbala(): void {
    if (!this.kundali) {
      return;
    }
    this.shadbalaBusy = true;
    this.shadbalaError = '';
    this.api.getShadbala(this.kundali.id).subscribe({
      next: (s) => {
        this.shadbala = s;
        this.shadbalaBusy = false;
        for (const p of s.planets || []) {
          this.expandedShadbala.add(p.planetCode);
        }
      },
      error: (err) => {
        this.shadbalaBusy = false;
        this.shadbala = null;
        this.shadbalaError = err?.error?.message || 'Could not load Shadbala.';
      },
    });
  }

  toggleShadbala(code: string): void {
    if (this.expandedShadbala.has(code)) {
      this.expandedShadbala.delete(code);
    } else {
      this.expandedShadbala.add(code);
    }
  }

  houseLabels(): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }

  binduSum(bindus: number[] | null | undefined): number {
    return (bindus || []).reduce((sum, b) => sum + (Number(b) || 0), 0);
  }

  fmtVirupa(v: number | null | undefined): string {
    if (v == null || Number.isNaN(Number(v))) {
      return '—';
    }
    return Number(v).toFixed(2);
  }

  private todayIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  fmtDeg(v: number | null | undefined): string {
    if (v == null || Number.isNaN(Number(v))) {
      return '—';
    }
    const n = Number(v);
    const d = Math.floor(n);
    const m = Math.floor((n - d) * 60);
    return `${d}° ${String(m).padStart(2, '0')}′`;
  }

  planetOf(code: string): PlanetDto | null {
    return this.kundali?.planets?.find((p) => p.planetCode === code) || null;
  }

  signLabel(name: string): string {
    return signFull(name, this.language.lang);
  }

  nakshatraLordLabel(): string {
    const mo = this.planetOf('MOON');
    if (!mo) {
      return '—';
    }
    const lords = [
      'KETU',
      'VENUS',
      'SUN',
      'MOON',
      'MARS',
      'RAHU',
      'JUPITER',
      'SATURN',
      'MERCURY',
    ];
    const code = lords[((mo.nakshatraIndex % 9) + 9) % 9];
    return planetFull(code, this.language.lang);
  }

  houseLord(signName: string): string {
    const lords: Record<string, string> = {
      Aries: 'MARS',
      Taurus: 'VENUS',
      Gemini: 'MERCURY',
      Cancer: 'MOON',
      Leo: 'SUN',
      Virgo: 'MERCURY',
      Libra: 'VENUS',
      Scorpio: 'MARS',
      Sagittarius: 'JUPITER',
      Capricorn: 'SATURN',
      Aquarius: 'SATURN',
      Pisces: 'JUPITER',
    };
    const code = lords[signName];
    return code ? planetFull(code, this.language.lang) : '—';
  }

  occupants(house: number): string {
    if (!this.kundali) {
      return '—';
    }
    const labels: string[] = [];
    if (this.kundali.ascendant?.house === house) {
      labels.push(planetFull('ASCENDANT', this.language.lang));
    }
    for (const p of this.kundali.planets || []) {
      if (p.house === house) {
        labels.push(planetFull(p.planetCode, this.language.lang) + (p.retrograde ? 'ᵣ' : ''));
      }
    }
    return labels.length ? labels.join(', ') : '—';
  }

  planetLabel(code: string): string {
    return planetFull(code, this.language.lang);
  }

  toggleDosha(code: string): void {
    if (this.expandedDosha.has(code)) {
      this.expandedDosha.delete(code);
    } else {
      this.expandedDosha.add(code);
    }
  }

  doshaStatusLabel(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'PRESENT') {
      return this.language.t('dosha.present');
    }
    if (s === 'CANCELLED') {
      return this.language.t('dosha.cancelled');
    }
    return this.language.t('dosha.absent');
  }

  doshaComingSoon(): { doshaCode: string; displayName: string }[] {
    return (this.doshas?.catalog || []).filter((c) => !c.implemented);
  }

  mahaWidthPct(m: DashaPeriodDto): number {
    if (!this.dasha?.timeline?.length) {
      return 8;
    }
    const starts = this.dasha.timeline.map((x) => new Date(x.startAt).getTime());
    const ends = this.dasha.timeline.map((x) => new Date(x.endAt).getTime());
    const min = Math.min(...starts);
    const max = Math.max(...ends);
    const span = max - min || 1;
    const w = ((new Date(m.endAt).getTime() - new Date(m.startAt).getTime()) / span) * 100;
    return Math.max(4, Math.min(40, w));
  }

  back(): void {
    this.router.navigateByUrl('/profiles');
  }
}
