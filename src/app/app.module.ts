import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { TenantInterceptor } from './core/tenant.interceptor';
import { DashboardPageComponent } from './dashboard/dashboard-page.component';
import { ProfilesPageComponent } from './profiles/profiles-page.component';
import { KundaliPageComponent } from './kundali/kundali-page.component';
import { KundaliChartComponent } from './kundali/kundali-chart.component';
import { LifeAnalysisPanelComponent } from './kundali/life-analysis-panel.component';
import { SimpleKundaliHomeComponent } from './kundali/simple-kundali-home.component';
import { MatchingPageComponent } from './matching/matching-page.component';
import { ClientsPageComponent } from './clients/clients-page.component';
import { AppointmentsPageComponent } from './appointments/appointments-page.component';
import { PanchangPageComponent } from './panchang/panchang-page.component';
import { TranslatePipe } from './core/i18n/translate.pipe';

const routes: Routes = [
  { path: '', component: DashboardPageComponent },
  { path: 'profiles', component: ProfilesPageComponent },
  { path: 'kundali/:id', component: KundaliPageComponent },
  { path: 'matching', component: MatchingPageComponent },
  { path: 'matching/:id', component: MatchingPageComponent },
  { path: 'clients', component: ClientsPageComponent },
  { path: 'clients/:id', component: ClientsPageComponent },
  { path: 'appointments', component: AppointmentsPageComponent },
  { path: 'panchang', component: PanchangPageComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardPageComponent,
    ProfilesPageComponent,
    KundaliPageComponent,
    KundaliChartComponent,
    LifeAnalysisPanelComponent,
    SimpleKundaliHomeComponent,
    MatchingPageComponent,
    ClientsPageComponent,
    AppointmentsPageComponent,
    PanchangPageComponent,
    TranslatePipe,
  ],
  imports: [BrowserModule, HttpClientModule, FormsModule, RouterModule.forRoot(routes)],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: TenantInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
