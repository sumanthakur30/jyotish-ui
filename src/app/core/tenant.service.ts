import { Injectable } from '@angular/core';

const TENANT_KEY = 'sf.jyotish.tenantId';
const SHOP_KEY = 'sf.jyotish.shopId';

@Injectable({ providedIn: 'root' })
export class TenantService {
  get tenantId(): string {
    return localStorage.getItem(TENANT_KEY) || '';
  }

  get shopId(): string {
    return localStorage.getItem(SHOP_KEY) || this.tenantId;
  }

  setTenant(tenantId: string): void {
    localStorage.setItem(TENANT_KEY, tenantId);
    if (!localStorage.getItem(SHOP_KEY)) {
      localStorage.setItem(SHOP_KEY, tenantId);
    }
  }
}
