import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  JyotishApiService,
  MatchingResponse,
  Profile,
} from '../core/jyotish-api.service';

@Component({
  selector: 'app-matching-page',
  templateUrl: './matching-page.component.html',
  styleUrls: ['./matching-page.component.scss'],
})
export class MatchingPageComponent implements OnInit {
  profiles: Profile[] = [];
  profileIdA: number | null = null;
  profileIdB: number | null = null;
  result: MatchingResponse | null = null;
  busy = false;
  error = '';
  message = '';
  reportBusy = false;

  constructor(
    private readonly api: JyotishApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSession(Number(id));
    }
  }

  loadProfiles(): void {
    this.api.listProfiles().subscribe({
      next: (res) => {
        this.profiles = (res.items || []).filter((p) => p.status !== 'ARCHIVED');
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not load profiles.';
      },
    });
  }

  runMatch(): void {
    if (this.profileIdA == null || this.profileIdB == null) {
      this.error = 'Select Person A and Person B.';
      return;
    }
    if (this.profileIdA === this.profileIdB) {
      this.error = 'Choose two different profiles.';
      return;
    }
    this.busy = true;
    this.error = '';
    this.message = '';
    this.api.createMatching(this.profileIdA, this.profileIdB).subscribe({
      next: (r) => {
        this.result = r;
        this.busy = false;
        this.message = 'Matching session saved.';
        this.router.navigate(['/matching', r.id], { replaceUrl: true });
      },
      error: (err) => {
        this.busy = false;
        this.result = null;
        this.error = err?.error?.message || 'Matching failed.';
      },
    });
  }

  loadSession(id: number): void {
    this.busy = true;
    this.error = '';
    this.api.getMatching(id).subscribe({
      next: (r) => {
        this.result = r;
        this.profileIdA = r.personA.profileId;
        this.profileIdB = r.personB.profileId;
        this.busy = false;
      },
      error: (err) => {
        this.busy = false;
        this.error = err?.error?.message || 'Could not load matching session.';
      },
    });
  }

  clearResult(): void {
    this.result = null;
    this.message = '';
    this.router.navigate(['/matching']);
  }

  downloadPdf(): void {
    if (!this.result) {
      return;
    }
    this.reportBusy = true;
    this.error = '';
    this.message = '';
    this.api.createReport({ type: 'MATCHING', matchingId: this.result.id }).subscribe({
      next: (meta) => {
        this.api.downloadReport(meta.id).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `jyotish-matching-${this.result!.id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            this.reportBusy = false;
            this.message = `Downloaded ${meta.displayTitle}.`;
          },
          error: (err) => {
            this.reportBusy = false;
            this.error = err?.error?.message || 'Could not download matching PDF.';
          },
        });
      },
      error: (err) => {
        this.reportBusy = false;
        this.error = err?.error?.message || 'Could not generate matching PDF.';
      },
    });
  }
}
