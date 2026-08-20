import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  JyotishApiService,
  PlaceSuggestion,
  Profile,
  UpsertProfileRequest,
} from '../core/jyotish-api.service';
import { TenantService } from '../core/tenant.service';

@Component({
  selector: 'app-profiles-page',
  templateUrl: './profiles-page.component.html',
  styleUrls: ['./profiles-page.component.scss'],
})
export class ProfilesPageComponent implements OnInit {
  profiles: Profile[] = [];
  searchQ = '';
  includeArchived = false;
  message = '';
  error = '';
  busy = false;
  generatingId: number | null = null;

  editingId: number | null = null;
  displayName = '';
  gender = '';
  birthDate = '';
  birthTime = '';
  birthTimeUnknown = false;
  dstObserved = false;
  timeZone = 'Asia/Kolkata';
  placeName = '';
  countryCode = 'IN';
  latitude: number | null = null;
  longitude: number | null = null;
  coordsManual = false;
  notes = '';

  placeQuery = '';
  placeHits: PlaceSuggestion[] = [];

  constructor(
    private readonly api: JyotishApiService,
    private readonly tenant: TenantService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.reloadProfiles();
  }

  reloadProfiles(): void {
    if (!this.tenant.tenantId) {
      return;
    }
    this.busy = true;
    this.api.listProfiles(this.searchQ, this.includeArchived).subscribe({
      next: (res) => {
        this.profiles = res.items || [];
        this.busy = false;
      },
      error: (err) => {
        this.busy = false;
        this.fail(err);
      },
    });
  }

  searchPlaces(): void {
    this.api.searchPlaces(this.placeQuery).subscribe({
      next: (res) => (this.placeHits = res.items || []),
      error: (err) => this.fail(err),
    });
  }

  pickPlace(p: PlaceSuggestion): void {
    this.placeName = p.placeName;
    this.countryCode = p.countryCode;
    this.latitude = Number(p.latitude);
    this.longitude = Number(p.longitude);
    this.timeZone = p.timeZone;
    this.coordsManual = false;
    this.placeHits = [];
    this.placeQuery = p.placeName;
  }

  startCreate(): void {
    this.editingId = null;
    this.displayName = '';
    this.gender = '';
    this.birthDate = '';
    this.birthTime = '';
    this.birthTimeUnknown = false;
    this.dstObserved = false;
    this.timeZone = 'Asia/Kolkata';
    this.placeName = '';
    this.countryCode = 'IN';
    this.latitude = null;
    this.longitude = null;
    this.coordsManual = false;
    this.notes = '';
    this.placeQuery = '';
    this.placeHits = [];
  }

  edit(p: Profile): void {
    this.editingId = p.id;
    this.displayName = p.displayName;
    this.gender = p.gender || '';
    this.birthDate = p.details.birthDate;
    this.birthTime = p.details.birthTime || '';
    this.birthTimeUnknown = p.details.birthTimeUnknown;
    this.dstObserved = p.details.dstObserved;
    this.timeZone = p.details.timeZone;
    this.placeName = p.location.placeName;
    this.countryCode = p.location.countryCode || 'IN';
    this.latitude = Number(p.location.latitude);
    this.longitude = Number(p.location.longitude);
    this.coordsManual = p.location.coordsManual;
    this.notes = p.notes || '';
    this.placeQuery = p.location.placeName;
  }

  saveProfile(): void {
    if (!this.displayName.trim()) {
      this.error = 'Name is required.';
      return;
    }
    if (!this.birthDate) {
      this.error = 'Date of birth is required.';
      return;
    }
    if (this.latitude == null || this.longitude == null || !this.placeName) {
      this.error = 'Please select a valid birth location.';
      return;
    }
    const body: UpsertProfileRequest = {
      displayName: this.displayName.trim(),
      gender: this.gender || null,
      notes: this.notes || null,
      details: {
        birthDate: this.birthDate,
        birthTime: this.birthTimeUnknown ? null : this.birthTime || null,
        birthTimeUnknown: this.birthTimeUnknown,
        dstObserved: this.dstObserved,
        timeZone: this.timeZone,
      },
      location: {
        placeName: this.placeName,
        countryCode: this.countryCode || null,
        latitude: this.latitude,
        longitude: this.longitude,
        timeZone: this.timeZone,
        coordsManual: this.coordsManual,
      },
    };
    this.busy = true;
    const req =
      this.editingId == null
        ? this.api.createProfile(body)
        : this.api.updateProfile(this.editingId, body);
    req.subscribe({
      next: () => {
        this.busy = false;
        this.message = this.editingId == null ? 'Birth profile created' : 'Birth profile updated';
        this.error = '';
        this.startCreate();
        this.reloadProfiles();
      },
      error: (err) => {
        this.busy = false;
        this.fail(err);
      },
    });
  }

  generateKundali(p: Profile): void {
    this.generatingId = p.id;
    this.api.generateKundali({ birthProfileId: p.id }).subscribe({
      next: (k) => {
        this.generatingId = null;
        this.router.navigate(['/kundali', k.id]);
      },
      error: (err) => {
        this.generatingId = null;
        this.fail(err);
      },
    });
  }

  duplicate(p: Profile): void {
    this.api.duplicateProfile(p.id).subscribe({
      next: () => {
        this.message = 'Profile duplicated';
        this.reloadProfiles();
      },
      error: (err) => this.fail(err),
    });
  }

  archive(p: Profile): void {
    this.api.archiveProfile(p.id).subscribe({
      next: () => {
        this.message = 'Profile archived';
        this.reloadProfiles();
      },
      error: (err) => this.fail(err),
    });
  }

  remove(p: Profile): void {
    if (!confirm(`Delete profile “${p.displayName}”?`)) {
      return;
    }
    this.api.deleteProfile(p.id).subscribe({
      next: () => {
        this.message = 'Profile deleted';
        this.reloadProfiles();
      },
      error: (err) => this.fail(err),
    });
  }

  private fail(err: { error?: { message?: string } }, fallback?: string): void {
    this.error = err?.error?.message || fallback || 'Request failed';
    this.message = '';
  }
}
