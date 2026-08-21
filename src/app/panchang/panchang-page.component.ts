import { Component, OnInit } from '@angular/core';
import {
  JyotishApiService,
  PanchangResponse,
  PlaceSuggestion,
} from '../core/jyotish-api.service';

@Component({
  selector: 'app-panchang-page',
  templateUrl: './panchang-page.component.html',
  styleUrls: ['./panchang-page.component.scss'],
})
export class PanchangPageComponent implements OnInit {
  date = '';
  placeQuery = '';
  placeHits: PlaceSuggestion[] = [];
  placeName = 'Delhi, India';
  latitude: number | null = 28.6139;
  longitude: number | null = 77.209;
  timeZone = 'Asia/Kolkata';
  ayanamsaCode = 'LAHIRI';

  result: PanchangResponse | null = null;
  busy = false;
  error = '';
  message = '';

  constructor(private readonly api: JyotishApiService) {}

  ngOnInit(): void {
    const today = new Date();
    this.date = today.toISOString().slice(0, 10);
  }

  searchPlaces(): void {
    this.api.searchPlaces(this.placeQuery).subscribe({
      next: (res) => {
        this.placeHits = res.items || [];
      },
      error: (err) => {
        this.error = err?.error?.message || 'Place search failed.';
      },
    });
  }

  pickPlace(p: PlaceSuggestion): void {
    this.placeName = p.placeName;
    this.latitude = Number(p.latitude);
    this.longitude = Number(p.longitude);
    this.timeZone = p.timeZone;
    this.placeQuery = p.placeName;
    this.placeHits = [];
  }

  compute(): void {
    if (!this.date) {
      this.error = 'Pick a date.';
      return;
    }
    if (this.latitude == null || this.longitude == null || !this.timeZone) {
      this.error = 'Place requires latitude, longitude, and timezone.';
      return;
    }
    this.busy = true;
    this.error = '';
    this.message = '';
    this.api
      .getPanchang({
        date: this.date,
        lat: this.latitude,
        lon: this.longitude,
        timezone: this.timeZone,
        placeName: this.placeName || undefined,
        ayanamsaCode: this.ayanamsaCode || undefined,
      })
      .subscribe({
        next: (r) => {
          this.result = r;
          this.busy = false;
          this.message = `Panchang · engine ${r.calculationEngineVersion}`;
        },
        error: (err) => {
          this.busy = false;
          this.result = null;
          this.error = err?.error?.message || 'Panchang compute failed.';
        },
      });
  }

  pct(progress: number | string | null | undefined): string {
    const n = typeof progress === 'string' ? Number(progress) : progress;
    if (n == null || Number.isNaN(n)) {
      return '—';
    }
    return Math.round(n * 100) + '%';
  }
}
