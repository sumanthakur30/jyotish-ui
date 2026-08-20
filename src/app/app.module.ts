import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { TenantInterceptor } from './core/tenant.interceptor';
import { ProfilesPageComponent } from './profiles/profiles-page.component';
import { KundaliPageComponent } from './kundali/kundali-page.component';
import { KundaliChartComponent } from './kundali/kundali-chart.component';
import { MatchingPageComponent } from './matching/matching-page.component';

const routes: Routes = [
  { path: '', component: ProfilesPageComponent },
  { path: 'kundali/:id', component: KundaliPageComponent },
  { path: 'matching', component: MatchingPageComponent },
  { path: 'matching/:id', component: MatchingPageComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  declarations: [
    AppComponent,
    ProfilesPageComponent,
    KundaliPageComponent,
    KundaliChartComponent,
    MatchingPageComponent,
  ],
  imports: [BrowserModule, HttpClientModule, FormsModule, RouterModule.forRoot(routes)],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: TenantInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
