import { Component, OnInit } from '@angular/core';
import {
  EntitlementsSnapshot,
  JyotishApiService,
  StatusResponse,
} from './core/jyotish-api.service';
import { EntitlementStateService } from './core/entitlement-state.service';
import { Lang, LanguageService } from './core/i18n/language.service';
import { TenantService } from './core/tenant.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  tenantDraft = '';
  status: StatusResponse | null = null;
  entitlements: EntitlementsSnapshot | null = null;
  message = '';
  error = '';

  constructor(
    private readonly api: JyotishApiService,
    private readonly tenant: TenantService,
    readonly entitlementState: EntitlementStateService,
    readonly language: LanguageService
  ) {}

  ngOnInit(): void {
    this.tenantDraft = this.tenant.tenantId || 'JYOTISH-DEMO-01';
    if (!this.tenant.tenantId) {
      this.tenant.setTenant(this.tenantDraft);
    }
    this.refreshStatus();
  }

  /** True when entitlement checks are off or the module flag is enabled. */
  can(module: keyof NonNullable<EntitlementsSnapshot['modules']>): boolean {
    return this.entitlementState.can(module);
  }

  get showUpgradeBanner(): boolean {
    return (
      !!this.status?.entitlementEnabled &&
      !!this.entitlements?.checksEnabled &&
      this.entitlements.modules?.kundali === false
    );
  }

  setLang(lang: Lang): void {
    this.language.setLang(lang);
    if (this.status) {
      this.message = this.language.t('status.connected', {
        service: this.status.service,
        phase: this.status.phase,
      });
    }
  }

  upgradeHint(): string {
    return this.language.t('upgrade.hint', {
      feature: this.language.t('upgrade.feature.core'),
    });
  }

  saveTenant(): void {
    this.tenant.setTenant(this.tenantDraft.trim());
    this.message = this.language.lang === 'hi' ? 'टेनेंट सेव हो गया' : 'Tenant saved';
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
        this.entitlementState.status = s;
        this.message = this.language.t('status.connected', {
          service: s.service,
          phase: s.phase,
        });
        if (s.entitlementEnabled) {
          this.loadEntitlements();
        } else {
          this.entitlements = null;
          this.entitlementState.entitlements = null;
        }
      },
      error: (err) =>
        this.fail(
          err,
          this.language.lang === 'hi'
            ? 'jyotish-service (:8097) से कनेक्ट नहीं हो सका।'
            : 'Could not reach jyotish-service on :8097.'
        ),
    });
  }

  private loadEntitlements(): void {
    this.api.entitlements().subscribe({
      next: (snap) => {
        this.entitlements = snap;
        this.entitlementState.entitlements = snap;
      },
      error: () => {
        /* keep null → fail-open UI until service answers */
      },
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
