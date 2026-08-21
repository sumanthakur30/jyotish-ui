import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  JyotishApiService,
  JyotishAppointment,
  MuhuratPeriodDto,
  PanchangResponse,
  Profile,
} from '../core/jyotish-api.service';
import { EntitlementStateService } from '../core/entitlement-state.service';
import { LanguageService } from '../core/i18n/language.service';

/** Default desk location until workspace place settings exist (Phase later). */
const DESK = {
  placeName: 'New Delhi, India',
  lat: 28.6139,
  lon: 77.209,
  timezone: 'Asia/Kolkata',
};

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit {
  busy = false;
  error = '';

  panchang: PanchangResponse | null = null;
  panchangBusy = false;
  panchangError = '';

  appointments: JyotishAppointment[] = [];
  apptBusy = false;
  apptError = '';

  recent: Profile[] = [];
  recentBusy = false;
  recentError = '';

  clientCount: number | null = null;
  generatingId: number | null = null;

  constructor(
    private readonly api: JyotishApiService,
    private readonly router: Router,
    readonly entitlements: EntitlementStateService,
    readonly language: LanguageService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.error = '';
    this.loadPanchang();
    this.loadAppointments();
    this.loadRecent();
    this.loadCrm();
  }

  todayLabel(): string {
    const d = new Date();
    return d.toLocaleDateString(this.language.lang === 'hi' ? 'hi-IN' : 'en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  limbName(limb: { name: string } | null | undefined): string {
    return limb?.name || '—';
  }

  solarTime(ev: { available: boolean; localTime: string | null } | null | undefined): string {
    if (!ev?.available || !ev.localTime) {
      return '—';
    }
    return ev.localTime.length > 5 ? ev.localTime.slice(0, 5) : ev.localTime;
  }

  muhuratByCode(code: string): MuhuratPeriodDto | null {
    const periods = this.panchang?.muhurat?.periods || [];
    return periods.find((p) => p.code === code) || null;
  }

  muhuratRange(code: string): string {
    const p = this.muhuratByCode(code);
    if (!p) {
      return '—';
    }
    return `${this.shortTime(p.start)}–${this.shortTime(p.end)}`;
  }

  private shortTime(isoOrLocal: string): string {
    if (!isoOrLocal) {
      return '—';
    }
    // API may return "HH:mm" or ISO; keep HH:mm when possible
    const m = isoOrLocal.match(/(\d{2}:\d{2})/);
    return m ? m[1] : isoOrLocal.slice(0, 5);
  }

  todaysOpenAppointments(): JyotishAppointment[] {
    return this.appointments.filter(
      (a) => a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && a.status !== 'NO_SHOW'
    );
  }

  pendingPayments(): JyotishAppointment[] {
    return this.appointments.filter((a) => {
      const p = (a.paymentStatus || '').toUpperCase();
      return p === 'UNPAID' || p === 'PENDING';
    });
  }

  openProfiles(): void {
    this.router.navigateByUrl('/profiles');
  }

  openClients(): void {
    this.router.navigateByUrl('/clients');
  }

  openAppointments(): void {
    this.router.navigateByUrl('/appointments');
  }

  openMatching(): void {
    this.router.navigateByUrl('/matching');
  }

  openPanchang(): void {
    this.router.navigateByUrl('/panchang');
  }

  openKundali(p: Profile): void {
    if (this.generatingId != null) {
      return;
    }
    this.generatingId = p.id;
    this.api.generateKundali({ birthProfileId: p.id }).subscribe({
      next: (k) => {
        this.generatingId = null;
        this.router.navigate(['/kundali', k.id]);
      },
      error: (err) => {
        this.generatingId = null;
        this.error = err?.error?.message || this.language.t('dash.kundaliError');
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

  private loadPanchang(): void {
    this.panchangBusy = true;
    this.panchangError = '';
    this.api
      .getPanchang({
        date: this.todayIso(),
        lat: DESK.lat,
        lon: DESK.lon,
        timezone: DESK.timezone,
        placeName: DESK.placeName,
      })
      .subscribe({
        next: (p) => {
          this.panchang = p;
          this.panchangBusy = false;
        },
        error: (err) => {
          this.panchang = null;
          this.panchangBusy = false;
          this.panchangError = err?.error?.message || this.language.t('dash.panchangError');
        },
      });
  }

  private loadAppointments(): void {
    this.apptBusy = true;
    this.apptError = '';
    const day = this.todayIso();
    this.api.listAppointments({ fromDate: day, toDate: day }).subscribe({
      next: (res) => {
        this.appointments = res.items || [];
        this.apptBusy = false;
      },
      error: (err) => {
        this.appointments = [];
        this.apptBusy = false;
        this.apptError = err?.error?.message || this.language.t('dash.apptError');
      },
    });
  }

  private loadRecent(): void {
    this.recentBusy = true;
    this.recentError = '';
    this.api.listProfiles().subscribe({
      next: (res) => {
        const items = [...(res.items || [])];
        items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
        this.recent = items.slice(0, 6);
        this.recentBusy = false;
      },
      error: (err) => {
        this.recent = [];
        this.recentBusy = false;
        this.recentError = err?.error?.message || this.language.t('dash.recentError');
      },
    });
  }

  private loadCrm(): void {
    this.api.crmDashboard().subscribe({
      next: (d) => {
        this.clientCount = d.totalClients;
      },
      error: () => {
        this.clientCount = null;
      },
    });
  }
}
