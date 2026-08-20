import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ChartCatalogItem,
  DashaPeriodDto,
  DashaResponse,
  JyotishApiService,
  KundaliResponse,
  VargaChartResponse,
} from '../core/jyotish-api.service';

@Component({
  selector: 'app-kundali-page',
  templateUrl: './kundali-page.component.html',
  styleUrls: ['./kundali-page.component.scss'],
})
export class KundaliPageComponent implements OnInit {
  kundali: KundaliResponse | null = null;
  tab: 'overview' | 'planets' | 'houses' | 'charts' | 'dasha' = 'overview';
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
