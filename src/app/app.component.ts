import { Component, OnInit } from '@angular/core';
import { JyotishApiService, StatusResponse } from './core/jyotish-api.service';
import { TenantService } from './core/tenant.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  tenantDraft = '';
  status: StatusResponse | null = null;
  message = '';
  error = '';

  constructor(
    private readonly api: JyotishApiService,
    private readonly tenant: TenantService
  ) {}

  ngOnInit(): void {
    this.tenantDraft = this.tenant.tenantId || 'JYOTISH-DEMO-01';
    if (!this.tenant.tenantId) {
      this.tenant.setTenant(this.tenantDraft);
    }
    this.refreshStatus();
  }

  saveTenant(): void {
    this.tenant.setTenant(this.tenantDraft.trim());
    this.message = 'Tenant saved';
    this.error = '';
    this.api.bootstrapWorkspace().subscribe({
      next: () => this.refreshStatus(),
      error: (err) => this.fail(err),
    });
  }

  refreshStatus(): void {
    this.api.status().subscribe({
      next: (s) => {
        this.status = s;
        this.message = `Connected · ${s.service} · ${s.phase}`;
      },
      error: (err) => this.fail(err, 'Could not reach jyotish-service on :8097.'),
    });
  }

  private fail(
    err: { error?: { message?: string } | string; message?: string },
    fallback?: string
  ): void {
    const bodyMsg =
      typeof err?.error === 'string'
        ? err.error
        : err?.error && typeof err.error === 'object'
          ? err.error.message
          : undefined;
    this.error = bodyMsg || err?.message || fallback || 'Request failed';
    this.message = '';
  }
}
