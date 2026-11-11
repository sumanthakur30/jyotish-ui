import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  loginUser = '';
  loginPass = '';
  loginBusy = false;

  constructor(
    private readonly api: JyotishApiService,
    private readonly http: HttpClient,
    readonly tenant: TenantService,
    readonly entitlementState: EntitlementStateService,
    readonly language: LanguageService
  ) {}

  ngOnInit(): void {
    this.tenant.consumeSsoFromLocation();
    if (this.tenant.locked && this.tenant.tokenExpired()) {
      this.tenant.logout();
    }
    this.tenantDraft = this.tenant.tenantId;
    if (this.tenant.tenantId) {
      this.refreshStatus();
    }
  }

  get showDesk(): boolean {
    return !!this.tenant.tenantId;
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
  }

  upgradeHint(): string {
    return this.language.t('upgrade.hint', {
      feature: this.language.t('upgrade.feature.core'),
    });
  }

  saveTenant(): void {
    if (this.tenant.locked) {
      return;
    }
    this.tenant.setTenant(this.tenantDraft.trim());
    this.message = this.language.lang === 'hi' ? 'टेनेंट सेव हो गया' : 'Tenant saved';
    this.error = '';
    this.api.bootstrapWorkspace().subscribe({
      next: () => this.refreshStatus(),
      error: (err) => this.fail(err),
    });
  }

  staffLogin(): void {
    this.loginBusy = true;
    this.error = '';
    this.http
      .post<{
        accessToken?: string;
        tenantId?: number;
        shopId?: string;
        username?: string;
        mfaRequired?: boolean;
        message?: string;
      }>('/api/v1/auth/login', {
        shopId: 'JHAASTRO',
        username: this.loginUser.trim(),
        password: this.loginPass,
      })
      .subscribe({
        next: (res) => {
          this.loginBusy = false;
          if (res.mfaRequired || !res.accessToken || res.tenantId == null) {
            this.error = this.language.t('session.loginError');
            return;
          }
          this.tenant.applySession({
            accessToken: res.accessToken,
            tenantId: String(res.tenantId),
            shopId: res.shopId,
            username: res.username,
          });
          this.loginPass = '';
          this.tenantDraft = this.tenant.tenantId;
          this.refreshStatus();
        },
        error: (err) => {
          this.loginBusy = false;
          this.fail(err, this.language.t('session.loginError'));
        },
      });
  }

  logout(): void {
    this.tenant.logout();
    this.status = null;
    this.tenantDraft = '';
    this.message = '';
    this.error = '';
  }

  refreshStatus(): void {
    this.api.status().subscribe({
      next: (s) => {
        this.status = s;
        this.entitlementState.status = s;
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
