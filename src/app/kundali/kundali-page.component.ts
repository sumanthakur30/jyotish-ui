import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ChartCatalogItem,
  DashaPeriodDto,
  DashaResponse,
  JyotishApiService,
  KundaliResponse,
  TransitResponse,
  VargaChartResponse,
  YogaCatalogItem,
  YogaDto,
  YogaListResponse,
} from '../core/jyotish-api.service';

@Component({
  selector: 'app-kundali-page',
  templateUrl: './kundali-page.component.html',
  styleUrls: ['./kundali-page.component.scss'],
})
export class KundaliPageComponent implements OnInit {
  kundali: KundaliResponse | null = null;
  tab: 'overview' | 'planets' | 'houses' | 'charts' | 'dasha' | 'yogas' | 'transit' | 'reports' =
    'overview';
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

  transit: TransitResponse | null = null;
  transitBusy = false;
  transitError = '';
  transitDate = '';

  reportBusy = false;
  reportMessage = '';
  reportError = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: JyotishApiService
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

  openReports(): void {
    this.tab = 'reports';
    this.reportMessage = '';
    this.reportError = '';
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
        this.yogaError = err?.error?.message || 'Could not load yogas.';
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

  back(): void {
    this.router.navigateByUrl('/');
  }
}
