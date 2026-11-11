import { Injectable } from '@angular/core';

const TENANT_KEY = 'sf.jyotish.tenantId';
const SHOP_KEY = 'sf.jyotish.shopId';
const TOKEN_KEY = 'sf.jyotish.accessToken';
const USER_KEY = 'sf.jyotish.username';
const LOCK_KEY = 'sf.jyotish.sessionLocked';

export interface JyotishJwtClaims {
  shopId?: string;
  tenantId?: string | number;
  sub?: string;
  username?: string;
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  get tenantId(): string {
    return localStorage.getItem(TENANT_KEY) || '';
  }

  get shopId(): string {
    return localStorage.getItem(SHOP_KEY) || this.tenantId;
  }

  get accessToken(): string {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  get username(): string {
    return localStorage.getItem(USER_KEY) || '';
  }

  get locked(): boolean {
    return localStorage.getItem(LOCK_KEY) === '1' && !!this.tenantId && !this.tokenExpired();
  }

  setTenant(tenantId: string, shopId?: string): void {
    if (this.locked) {
      return;
    }
    localStorage.setItem(TENANT_KEY, tenantId);
    if (shopId) {
      localStorage.setItem(SHOP_KEY, shopId);
    } else if (!localStorage.getItem(SHOP_KEY)) {
      localStorage.setItem(SHOP_KEY, tenantId);
    }
  }

  applySession(opts: {
    accessToken: string;
    tenantId: string;
    shopId?: string;
    username?: string;
  }): void {
    localStorage.setItem(TOKEN_KEY, opts.accessToken);
    localStorage.setItem(TENANT_KEY, opts.tenantId);
    localStorage.setItem(SHOP_KEY, opts.shopId || opts.tenantId);
    if (opts.username) {
      localStorage.setItem(USER_KEY, opts.username);
    }
    localStorage.setItem(LOCK_KEY, '1');
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LOCK_KEY);
    localStorage.removeItem(TENANT_KEY);
    localStorage.removeItem(SHOP_KEY);
  }

  consumeSsoFromLocation(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    const hash = window.location.hash || '';
    const fromHash = /(?:^|#|&)sso=([^&]+)/.exec(hash);
    const params = new URLSearchParams(window.location.search);
    const raw = fromHash?.[1] || params.get('sso') || params.get('accessToken') || '';
    const token = raw ? decodeURIComponent(raw) : '';
    if (!token || token.split('.').length < 3) {
      return false;
    }
    const claims = this.decodeJwt(token);
    const tenantId = claims?.tenantId != null ? String(claims.tenantId) : '';
    if (!tenantId) {
      return false;
    }
    this.applySession({
      accessToken: token,
      tenantId,
      shopId: claims?.shopId ? String(claims.shopId) : tenantId,
      username: claims?.username || claims?.sub || '',
    });
    const url = new URL(window.location.href);
    url.searchParams.delete('sso');
    url.searchParams.delete('accessToken');
    url.hash = '';
    window.history.replaceState({}, '', url.pathname + url.search);
    return true;
  }

  tokenExpired(): boolean {
    const claims = this.decodeJwt(this.accessToken);
    if (!claims?.exp) {
      return false;
    }
    return claims.exp * 1000 <= Date.now();
  }

  decodeJwt(token: string): JyotishJwtClaims | null {
    if (!token) {
      return null;
    }
    try {
      const part = token.split('.')[1];
      if (!part) {
        return null;
      }
      const padded = part.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(padded)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json) as JyotishJwtClaims;
    } catch {
      return null;
    }
  }
}
