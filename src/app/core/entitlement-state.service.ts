import { Injectable } from '@angular/core';
import { EntitlementsSnapshot, StatusResponse } from './jyotish-api.service';

/** Shared entitlement state for tab gating (populated by AppComponent). */
@Injectable({ providedIn: 'root' })
export class EntitlementStateService {
  status: StatusResponse | null = null;
  entitlements: EntitlementsSnapshot | null = null;

  can(module: keyof NonNullable<EntitlementsSnapshot['modules']>): boolean {
    if (!this.status?.entitlementEnabled) {
      return true;
    }
    if (!this.entitlements) {
      return true;
    }
    if (!this.entitlements.checksEnabled) {
      return true;
    }
    return this.entitlements.modules?.[module] !== false;
  }
}
