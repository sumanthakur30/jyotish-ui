import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  JyotishApiService,
  JyotishClient,
  Profile,
  UpsertClientRequest,
} from '../core/jyotish-api.service';
import { TenantService } from '../core/tenant.service';

@Component({
  selector: 'app-clients-page',
  templateUrl: './clients-page.component.html',
  styleUrls: ['./clients-page.component.scss'],
})
export class ClientsPageComponent implements OnInit {
  clients: JyotishClient[] = [];
  profiles: Profile[] = [];
  searchQ = '';
  message = '';
  error = '';
  busy = false;
  totalClients = 0;
  todaysAppointments = 0;

  editingId: number | null = null;
  name = '';
  mobile = '';
  email = '';
  notes = '';
  selectedProfileIds: number[] = [];
  detail: JyotishClient | null = null;

  constructor(
    private readonly api: JyotishApiService,
    private readonly tenant: TenantService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.reloadDashboard();
    this.reloadClients();
    this.reloadProfiles();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadDetail(+id);
      } else {
        this.detail = null;
      }
    });
  }

  reloadDashboard(): void {
    if (!this.tenant.tenantId) {
      return;
    }
    this.api.crmDashboard().subscribe({
      next: (d) => {
        this.totalClients = d.totalClients;
        this.todaysAppointments = d.todaysAppointments;
      },
      error: () => {
        /* optional cards */
      },
    });
  }

  reloadProfiles(): void {
    if (!this.tenant.tenantId) {
      return;
    }
    this.api.listProfiles('', false).subscribe({
      next: (res) => (this.profiles = res.items || []),
      error: () => (this.profiles = []),
    });
  }

  reloadClients(): void {
    if (!this.tenant.tenantId) {
      return;
    }
    this.busy = true;
    this.api.listClients(this.searchQ).subscribe({
      next: (res) => {
        this.clients = res.items || [];
        this.busy = false;
        this.reloadDashboard();
      },
      error: (err) => {
        this.busy = false;
        this.fail(err);
      },
    });
  }

  loadDetail(id: number): void {
    this.api.getClient(id).subscribe({
      next: (c) => {
        this.detail = c;
        this.edit(c);
      },
      error: (err) => this.fail(err),
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.detail = null;
    this.name = '';
    this.mobile = '';
    this.email = '';
    this.notes = '';
    this.selectedProfileIds = [];
    this.router.navigate(['/clients']);
  }

  edit(c: JyotishClient): void {
    this.editingId = c.id;
    this.name = c.name;
    this.mobile = c.mobile || '';
    this.email = c.email || '';
    this.notes = c.notes || '';
    this.selectedProfileIds = [...(c.birthProfileIds || [])];
  }

  openDetail(c: JyotishClient): void {
    this.router.navigate(['/clients', c.id]);
  }

  toggleProfile(id: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedProfileIds.includes(id)) {
        this.selectedProfileIds = [...this.selectedProfileIds, id];
      }
    } else {
      this.selectedProfileIds = this.selectedProfileIds.filter((x) => x !== id);
    }
  }

  isProfileSelected(id: number): boolean {
    return this.selectedProfileIds.includes(id);
  }

  profileLabel(id: number): string {
    const p = this.profiles.find((x) => x.id === id);
    return p ? p.displayName : `Profile #${id}`;
  }

  saveClient(): void {
    if (!this.name.trim()) {
      this.error = 'Name is required.';
      return;
    }
    const body: UpsertClientRequest = {
      name: this.name.trim(),
      mobile: this.mobile.trim() || null,
      email: this.email.trim() || null,
      notes: this.notes || null,
      birthProfileIds: this.selectedProfileIds,
    };
    this.busy = true;
    const req =
      this.editingId == null
        ? this.api.createClient(body)
        : this.api.updateClient(this.editingId, body);
    req.subscribe({
      next: (c) => {
        this.busy = false;
        this.message = this.editingId == null ? 'Client created' : 'Client updated';
        this.error = '';
        this.reloadClients();
        this.router.navigate(['/clients', c.id]);
      },
      error: (err) => {
        this.busy = false;
        this.fail(err);
      },
    });
  }

  remove(c: JyotishClient): void {
    if (!confirm(`Delete client “${c.name}”?`)) {
      return;
    }
    this.api.deleteClient(c.id).subscribe({
      next: () => {
        this.message = 'Client deleted';
        if (this.editingId === c.id) {
          this.startCreate();
        }
        this.reloadClients();
      },
      error: (err) => this.fail(err),
    });
  }

  private fail(err: { error?: { message?: string } }, fallback?: string): void {
    this.error = err?.error?.message || fallback || 'Request failed';
    this.message = '';
  }
}
