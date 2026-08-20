import { Component, OnInit } from '@angular/core';
import {
  AppointmentStatus,
  JyotishApiService,
  JyotishAppointment,
  JyotishClient,
  UpsertAppointmentRequest,
} from '../core/jyotish-api.service';
import { TenantService } from '../core/tenant.service';

@Component({
  selector: 'app-appointments-page',
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss'],
})
export class AppointmentsPageComponent implements OnInit {
  appointments: JyotishAppointment[] = [];
  clients: JyotishClient[] = [];
  message = '';
  error = '';
  busy = false;
  totalClients = 0;
  todaysAppointments = 0;

  editingId: number | null = null;
  clientId: number | null = null;
  appointmentDate = '';
  appointmentTime = '';
  consultationType = 'KUNDALI_READING';
  status: AppointmentStatus | string = 'SCHEDULED';
  paymentStatus: string = '';
  notes = '';
  filterStatus = '';

  readonly statuses: AppointmentStatus[] = [
    'SCHEDULED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ];

  readonly consultationTypes = [
    'KUNDALI_READING',
    'MATCHING',
    'DASHA_REVIEW',
    'GOCHAR',
    'GENERAL',
  ];

  constructor(
    private readonly api: JyotishApiService,
    private readonly tenant: TenantService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.appointmentDate = today.toISOString().slice(0, 10);
    this.appointmentTime = '10:00';
    this.reloadDashboard();
    this.reloadClients();
    this.reloadAppointments();
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
        /* optional */
      },
    });
  }

  reloadClients(): void {
    if (!this.tenant.tenantId) {
      return;
    }
    this.api.listClients().subscribe({
      next: (res) => (this.clients = res.items || []),
      error: () => (this.clients = []),
    });
  }

  reloadAppointments(): void {
    if (!this.tenant.tenantId) {
      return;
    }
    this.busy = true;
    this.api
      .listAppointments({
        status: this.filterStatus || undefined,
      })
      .subscribe({
        next: (res) => {
          this.appointments = res.items || [];
          this.busy = false;
          this.reloadDashboard();
        },
        error: (err) => {
          this.busy = false;
          this.fail(err);
        },
      });
  }

  startCreate(): void {
    this.editingId = null;
    this.clientId = null;
    const today = new Date();
    this.appointmentDate = today.toISOString().slice(0, 10);
    this.appointmentTime = '10:00';
    this.consultationType = 'KUNDALI_READING';
    this.status = 'SCHEDULED';
    this.paymentStatus = '';
    this.notes = '';
  }

  edit(a: JyotishAppointment): void {
    this.editingId = a.id;
    this.clientId = a.clientId;
    this.appointmentDate = a.appointmentDate;
    this.appointmentTime = (a.appointmentTime || '').slice(0, 5);
    this.consultationType = a.consultationType;
    this.status = a.status;
    this.paymentStatus = a.paymentStatus || '';
    this.notes = a.notes || '';
  }

  saveAppointment(): void {
    if (this.clientId == null) {
      this.error = 'Select a client.';
      return;
    }
    if (!this.appointmentDate || !this.appointmentTime) {
      this.error = 'Date and time are required.';
      return;
    }
    const body: UpsertAppointmentRequest = {
      clientId: this.clientId,
      appointmentDate: this.appointmentDate,
      appointmentTime: this.appointmentTime.length === 5
        ? `${this.appointmentTime}:00`
        : this.appointmentTime,
      consultationType: this.consultationType,
      status: this.status || 'SCHEDULED',
      paymentStatus: this.paymentStatus || null,
      notes: this.notes || null,
    };
    this.busy = true;
    const req =
      this.editingId == null
        ? this.api.createAppointment(body)
        : this.api.updateAppointment(this.editingId, body);
    req.subscribe({
      next: () => {
        this.busy = false;
        this.message =
          this.editingId == null ? 'Appointment created' : 'Appointment updated';
        this.error = '';
        this.startCreate();
        this.reloadAppointments();
      },
      error: (err) => {
        this.busy = false;
        this.fail(err);
      },
    });
  }

  remove(a: JyotishAppointment): void {
    if (!confirm(`Cancel/delete appointment for ${a.clientName}?`)) {
      return;
    }
    this.api.deleteAppointment(a.id).subscribe({
      next: () => {
        this.message = 'Appointment deleted';
        this.reloadAppointments();
      },
      error: (err) => this.fail(err),
    });
  }

  private fail(err: { error?: { message?: string } }, fallback?: string): void {
    this.error = err?.error?.message || fallback || 'Request failed';
    this.message = '';
  }
}
