import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JyotishApiService, KundaliResponse } from '../core/jyotish-api.service';

@Component({
  selector: 'app-kundali-page',
  templateUrl: './kundali-page.component.html',
  styleUrls: ['./kundali-page.component.scss'],
})
export class KundaliPageComponent implements OnInit {
  kundali: KundaliResponse | null = null;
  tab: 'overview' | 'planets' | 'houses' = 'overview';
  error = '';
  busy = false;

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
