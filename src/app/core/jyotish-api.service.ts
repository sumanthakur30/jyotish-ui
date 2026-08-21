import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatusResponse {
  service: string;
  phase: string;
  engineVersion: string;
  entitlementEnabled: boolean;
  entitlementFlag: string;
}

export interface EntitlementsSnapshot {
  checksEnabled: boolean;
  features: Record<string, boolean>;
  modules: {
    kundali?: boolean;
    transit?: boolean;
    matching?: boolean;
    reports?: boolean;
    ai?: boolean;
    profiles?: boolean;
    clients?: boolean;
    appointments?: boolean;
  };
}

export interface BirthDetails {
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  dstObserved: boolean;
  timeZone: string;
}

export interface BirthLocation {
  placeName: string;
  countryCode: string | null;
  latitude: number;
  longitude: number;
  timeZone: string;
  coordsManual: boolean;
}

export interface Profile {
  id: number;
  displayName: string;
  gender: string | null;
  status: string;
  clientRef: string | null;
  notes: string | null;
  details: BirthDetails;
  location: BirthLocation;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceSuggestion {
  placeName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timeZone: string;
}

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'WAIVED';

export interface JyotishClient {
  id: number;
  name: string;
  mobile: string | null;
  email: string | null;
  notes: string | null;
  birthProfileIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface UpsertClientRequest {
  name: string;
  mobile?: string | null;
  email?: string | null;
  notes?: string | null;
  birthProfileIds?: number[];
}

export interface JyotishAppointment {
  id: number;
  clientId: number;
  clientName: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: string;
  status: AppointmentStatus | string;
  paymentStatus: PaymentStatus | string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAppointmentRequest {
  clientId: number;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: string;
  status?: AppointmentStatus | string | null;
  paymentStatus?: PaymentStatus | string | null;
  notes?: string | null;
}

export interface CrmDashboard {
  totalClients: number;
  todaysAppointments: number;
}

export interface UpsertProfileRequest {
  displayName: string;
  gender?: string | null;
  clientRef?: string | null;
  notes?: string | null;
  details: {
    birthDate: string;
    birthTime?: string | null;
    birthTimeUnknown?: boolean;
    dstObserved?: boolean;
    timeZone: string;
  };
  location: {
    placeName: string;
    countryCode?: string | null;
    latitude: number;
    longitude: number;
    timeZone: string;
    coordsManual?: boolean;
  };
}

export interface PlanetDto {
  planetCode: string;
  planetName: string;
  longitudeDeg: number;
  signIndex: number;
  signName: string;
  degreeInSign: number;
  house: number;
  nakshatraIndex: number;
  nakshatraName: string;
  pada: number;
  retrograde: boolean;
  combust: boolean;
  speedDegPerDay: number | null;
}

export interface HouseDto {
  house: number;
  signIndex: number;
  signName: string;
  cuspLongitudeDeg: number;
}

export interface ComingSoonFeature {
  code: string;
  label: string;
}

export interface ChartCatalogItem {
  vargaCode: string;
  displayName: string;
  divisions: number;
  implemented: boolean;
  computed: boolean;
  status: string;
}

export interface VargaChartResponse {
  kundaliId: number;
  chartId: number | null;
  vargaCode: string;
  displayName: string;
  calculationEngineVersion: string;
  houseSystem: string;
  ascendant: PlanetDto | null;
  planets: PlanetDto[];
  houses: HouseDto[];
  notes: string | null;
  comingSoon: boolean;
  createdAt: string;
}

export interface DashaCatalogItem {
  systemCode: string;
  displayName: string;
  implemented: boolean;
  status: string;
}

export interface DashaPeriodDto {
  level: string;
  lordCode: string;
  lordName: string;
  mahaLordCode: string | null;
  antarLordCode: string | null;
  pratyantarLordCode: string | null;
  startAt: string;
  endAt: string;
  remainingDays: number | null;
  current: boolean;
  children: DashaPeriodDto[];
}

export interface DashaCurrentDto {
  maha: DashaPeriodDto | null;
  antar: DashaPeriodDto | null;
  pratyantar: DashaPeriodDto | null;
}

export interface DashaResponse {
  kundaliId: number;
  systemCode: string;
  displayName: string;
  calculationEngineVersion: string;
  moonNakshatraIndex: number;
  moonNakshatraName: string;
  birthMahadashaLord: string;
  balanceAtBirthYears: number;
  elapsedAtBirthYears: number;
  current: DashaCurrentDto;
  timeline: DashaPeriodDto[];
  catalog: DashaCatalogItem[];
  notes: string | null;
  interpretationPlaceholder: string;
  asOf: string;
}

export interface YogaCatalogItem {
  yogaCode: string;
  displayName: string;
  categoryCode: string;
  categoryName: string;
  implemented: boolean;
  status: string;
}

export interface YogaDto {
  yogaCode: string;
  displayName: string;
  categoryCode: string;
  categoryName: string;
  present: boolean;
  strengthCode: string | null;
  strengthLabel: string | null;
  planets: string[];
  houses: number[];
  explanation: string;
  ruleId: string;
}

export interface YogaListResponse {
  kundaliId: number;
  calculationEngineVersion: string;
  categoryFilter: string | null;
  yogas: YogaDto[];
  catalog: YogaCatalogItem[];
  notes: string | null;
  disclaimer: string;
}

export interface TransitCatalogItem {
  systemCode: string;
  displayName: string;
  implemented: boolean;
  status: string;
}

export interface TransitComingSoon {
  code: string;
  label: string;
}

export interface TransitPlanetDto {
  planetCode: string;
  planetName: string;
  longitudeDeg: number;
  signIndex: number;
  signName: string;
  degreeInSign: number;
  house: number;
  nakshatraIndex: number;
  nakshatraName: string;
  pada: number;
  retrograde: boolean;
  speedDegPerDay: number | null;
  natalLongitudeDeg: number | null;
  natalSignIndex: number | null;
  natalSignName: string | null;
  natalHouse: number | null;
  signChanged: boolean;
  houseChanged: boolean;
}

export interface SadeSatiDto {
  phaseCode: string;
  phaseLabel: string;
  natalMoonSignIndex: number;
  natalMoonSignName: string;
  transitSaturnSignIndex: number;
  transitSaturnSignName: string;
  signsFromMoon: number;
  houseFromMoon: number;
  inSadeSati: boolean;
  notes: string | null;
}

export interface TransitResponse {
  id: number;
  kundaliId: number;
  transitDate: string;
  transitTime: string;
  timeZone: string;
  systemCode: string;
  systemDisplayName: string;
  calculationEngineVersion: string;
  ayanamsaCode: string;
  ayanamsaDeg: number;
  julianDayUt: number;
  natalLagnaSignIndex: number;
  planets: TransitPlanetDto[];
  sadeSati: SadeSatiDto | null;
  catalog: TransitCatalogItem[];
  comingSoon: TransitComingSoon[];
  notes: string | null;
  disclaimer: string;
  createdAt: string;
}

export interface MatchingPersonSummary {
  profileId: number;
  displayName: string;
  kundaliId: number | null;
  moonSignIndex: number;
  moonSignName: string;
  moonNakshatraIndex: number;
  moonNakshatraName: string;
}

export interface KootaScoreDto {
  kootaCode: string;
  displayName: string;
  obtained: number;
  maxPoints: number;
  explanation: string;
  ruleId: string;
}

export interface ManglikDto {
  status: string;
  statusLabel: string;
  present: boolean;
  cancelled: boolean;
  marsHouse: number;
  marsSignIndex: number;
  marsSignName: string;
  relevantHouses: number[];
  reasoning: string;
  appliedCancellations: string[];
  cancellationsComingSoon: boolean;
  cancellationsNote: string;
}

export interface MatchingCatalogItem {
  systemCode: string;
  displayName: string;
  implemented: boolean;
  status: string;
}

export interface MatchingResponse {
  id: number;
  personA: MatchingPersonSummary;
  personB: MatchingPersonSummary;
  kootas: KootaScoreDto[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  manglikA: ManglikDto;
  manglikB: ManglikDto;
  summary: string;
  notes: string;
  disclaimer: string;
  calculationEngineVersion: string;
  catalog: MatchingCatalogItem[];
  createdAt: string;
}

/** Canonical report types. Server also accepts BASIC_KUNDALI aliases: KUNDALI_SUMMARY, KUNDALI, BASIC. */
export type ReportType = 'BASIC_KUNDALI' | 'MATCHING' | 'DASHA_SUMMARY' | 'TRANSIT';

export interface ReportResponse {
  id: number;
  type: ReportType | string;
  kundaliId: number | null;
  matchingId: number | null;
  displayTitle: string;
  storagePath: string;
  fileSizeBytes: number;
  contentType: string;
  calculationEngineVersion: string;
  generatedAt: string;
  downloadPath: string;
}

export type AiTopic =
  | 'general'
  | 'career'
  | 'marriage'
  | 'finance'
  | 'health'
  | 'education'
  | 'family'
  | 'spirituality';

export interface AiAskRequest {
  kundaliId: number;
  question: string;
  topic?: AiTopic | string | null;
}

export interface AiAskResponse {
  kundaliId: number;
  topic: string;
  question: string;
  answer: string;
  findings: string[];
  contextUsed: Record<string, unknown>;
  aiGenerated: boolean;
  providerCode: string;
  disclaimer: string;
  askId: number | null;
}

export interface PanchangLimb {
  index: number;
  name: string;
  paksha: string | null;
  pada: number | null;
  progress: number;
  detail: string | null;
}

export interface PanchangSolarEvent {
  available: boolean;
  localTime: string | null;
  instant: string | null;
  note: string | null;
}

export interface PanchangLunarEvent {
  available: boolean;
  localTime: string | null;
  instant: string | null;
  note: string | null;
}

export interface PanchangCatalogItem {
  code: string;
  displayName: string;
  implemented: boolean;
  status: string;
}

export interface PanchangComingSoon {
  code: string;
  label: string;
}

export interface MuhuratPeriodDto {
  code: string;
  name: string;
  start: string;
  end: string;
  quality: string | null;
}

export interface MuhuratBundleDto {
  periods: MuhuratPeriodDto[];
  notes: string | null;
}

export interface PanchangResponse {
  date: string;
  timeZone: string;
  placeName: string | null;
  latitude: number;
  longitude: number;
  ayanamsaCode: string;
  ayanamsaDeg: number;
  julianDayUt: number;
  asOf: string;
  calculationEngineVersion: string;
  tithi: PanchangLimb;
  vara: PanchangLimb;
  nakshatra: PanchangLimb;
  yoga: PanchangLimb;
  karana: PanchangLimb;
  sunrise: PanchangSolarEvent;
  sunset: PanchangSolarEvent;
  moonrise: PanchangLunarEvent;
  moonset: PanchangLunarEvent;
  muhurat: MuhuratBundleDto | null;
  catalog: PanchangCatalogItem[];
  comingSoon: PanchangComingSoon[];
  notes: string | null;
  disclaimer: string;
}

export interface AshtakavargaPlanetDto {
  planetCode: string;
  planetName: string;
  bindus: number[];
}

export interface AshtakavargaResponse {
  kundaliId: number;
  calculationEngineVersion: string;
  bhinnashtakavarga: AshtakavargaPlanetDto[];
  sarvashtakavarga: number[];
  totalBindus: number;
  notes: string | null;
  disclaimer: string;
}

export interface ShadbalaComponentDto {
  code: string;
  displayName: string;
  status: string;
  virupas: number | null;
  note: string | null;
}

export interface ShadbalaPlanetDto {
  planetCode: string;
  planetName: string;
  signIndex: number;
  house: number;
  components: ShadbalaComponentDto[];
  implementedComponents: string[];
  comingSoonComponents: string[];
  partialTotalVirupas: number;
  notes: string | null;
}

export interface ShadbalaResponse {
  kundaliId: number;
  calculationEngineVersion: string;
  completeness: string;
  planets: ShadbalaPlanetDto[];
  notes: string | null;
  disclaimer: string;
}

export interface KundaliResponse {
  id: number;
  birthProfileId: number | null;
  displayName: string;
  birthDate: string;
  birthTime: string | null;
  birthTimeUnknown: boolean;
  timeZone: string;
  placeName: string;
  latitude: number;
  longitude: number;
  ayanamsaCode: string;
  ayanamsaDeg: number;
  zodiacSystem: string;
  houseSystem: string;
  chartStyle: string;
  calculationEngineVersion: string;
  julianDayUt: number;
  ascendant: PlanetDto | null;
  planets: PlanetDto[];
  houses: HouseDto[];
  notes: string | null;
  comingSoon: ComingSoonFeature[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class JyotishApiService {
  constructor(private readonly http: HttpClient) {}

  status(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>('/api/v1/jyotish/status');
  }

  entitlements(): Observable<EntitlementsSnapshot> {
    return this.http.get<EntitlementsSnapshot>('/api/v1/jyotish/entitlements');
  }

  listProfiles(q?: string, includeArchived = false): Observable<{ items: Profile[] }> {
    let params = new HttpParams().set('includeArchived', String(includeArchived));
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<{ items: Profile[] }>('/api/v1/jyotish/profiles', { params });
  }

  createProfile(body: UpsertProfileRequest): Observable<Profile> {
    return this.http.post<Profile>('/api/v1/jyotish/profiles', body);
  }

  updateProfile(id: number, body: UpsertProfileRequest): Observable<Profile> {
    return this.http.put<Profile>(`/api/v1/jyotish/profiles/${id}`, body);
  }

  duplicateProfile(id: number): Observable<Profile> {
    return this.http.post<Profile>(`/api/v1/jyotish/profiles/${id}/duplicate`, {});
  }

  archiveProfile(id: number): Observable<Profile> {
    return this.http.post<Profile>(`/api/v1/jyotish/profiles/${id}/archive`, {});
  }

  deleteProfile(id: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/jyotish/profiles/${id}`);
  }

  searchPlaces(q: string): Observable<{ items: PlaceSuggestion[] }> {
    const params = new HttpParams().set('q', q || '');
    return this.http.get<{ items: PlaceSuggestion[] }>('/api/v1/jyotish/places', { params });
  }

  bootstrapWorkspace(name?: string): Observable<unknown> {
    return this.http.post('/api/v1/jyotish/workspaces/bootstrap', { name: name || 'Sugam Jyotish' });
  }

  generateKundali(body: {
    birthProfileId?: number;
    birth?: unknown;
    ayanamsaCode?: string;
  }): Observable<KundaliResponse> {
    return this.http.post<KundaliResponse>('/api/v1/jyotish/kundali/generate', body);
  }

  getKundali(id: number): Observable<KundaliResponse> {
    return this.http.get<KundaliResponse>(`/api/v1/jyotish/kundali/${id}`);
  }

  listCharts(kundaliId: number): Observable<{ kundaliId: number; charts: ChartCatalogItem[] }> {
    return this.http.get<{ kundaliId: number; charts: ChartCatalogItem[] }>(
      `/api/v1/jyotish/kundali/${kundaliId}/charts`
    );
  }

  getChart(kundaliId: number, varga: string): Observable<VargaChartResponse> {
    return this.http.get<VargaChartResponse>(
      `/api/v1/jyotish/kundali/${kundaliId}/charts/${varga}`
    );
  }

  getDasha(kundaliId: number, system = 'VIMSHOTTARI'): Observable<DashaResponse> {
    return this.http.get<DashaResponse>(
      `/api/v1/jyotish/kundali/${kundaliId}/dasha/${system}`
    );
  }

  getYogas(kundaliId: number, category?: string): Observable<YogaListResponse> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<YogaListResponse>(`/api/v1/jyotish/kundali/${kundaliId}/yogas`, {
      params,
    });
  }

  getAshtakavarga(kundaliId: number): Observable<AshtakavargaResponse> {
    return this.http.get<AshtakavargaResponse>(
      `/api/v1/jyotish/kundali/${kundaliId}/ashtakavarga`
    );
  }

  getShadbala(kundaliId: number): Observable<ShadbalaResponse> {
    return this.http.get<ShadbalaResponse>(`/api/v1/jyotish/kundali/${kundaliId}/shadbala`);
  }

  getTransit(
    kundaliId: number,
    date?: string,
    time?: string
  ): Observable<TransitResponse> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    if (time) {
      params = params.set('time', time);
    }
    return this.http.get<TransitResponse>(`/api/v1/jyotish/kundali/${kundaliId}/transit`, {
      params,
    });
  }

  createTransit(body: {
    kundaliId: number;
    date?: string;
    time?: string;
  }): Observable<TransitResponse> {
    return this.http.post<TransitResponse>('/api/v1/jyotish/transit', body);
  }

  createMatching(profileIdA: number, profileIdB: number): Observable<MatchingResponse> {
    return this.http.post<MatchingResponse>('/api/v1/jyotish/matching', {
      profileIdA,
      profileIdB,
    });
  }

  getMatching(id: number): Observable<MatchingResponse> {
    return this.http.get<MatchingResponse>(`/api/v1/jyotish/matching/${id}`);
  }

  createReport(body: {
    type: ReportType | string;
    kundaliId?: number;
    matchingId?: number;
  }): Observable<ReportResponse> {
    return this.http.post<ReportResponse>('/api/v1/jyotish/reports', body);
  }

  getReport(id: number): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`/api/v1/jyotish/reports/${id}`);
  }

  /** Returns PDF blob for browser download. */
  downloadReport(id: number): Observable<Blob> {
    return this.http.get(`/api/v1/jyotish/reports/${id}/download`, {
      responseType: 'blob',
    });
  }

  crmDashboard(): Observable<CrmDashboard> {
    return this.http.get<CrmDashboard>('/api/v1/jyotish/clients/dashboard');
  }

  listClients(q?: string): Observable<{ items: JyotishClient[] }> {
    let params = new HttpParams();
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<{ items: JyotishClient[] }>('/api/v1/jyotish/clients', { params });
  }

  getClient(id: number): Observable<JyotishClient> {
    return this.http.get<JyotishClient>(`/api/v1/jyotish/clients/${id}`);
  }

  createClient(body: UpsertClientRequest): Observable<JyotishClient> {
    return this.http.post<JyotishClient>('/api/v1/jyotish/clients', body);
  }

  updateClient(id: number, body: UpsertClientRequest): Observable<JyotishClient> {
    return this.http.put<JyotishClient>(`/api/v1/jyotish/clients/${id}`, body);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/jyotish/clients/${id}`);
  }

  listAppointments(opts?: {
    clientId?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
  }): Observable<{ items: JyotishAppointment[] }> {
    let params = new HttpParams();
    if (opts?.clientId != null) {
      params = params.set('clientId', String(opts.clientId));
    }
    if (opts?.fromDate) {
      params = params.set('fromDate', opts.fromDate);
    }
    if (opts?.toDate) {
      params = params.set('toDate', opts.toDate);
    }
    if (opts?.status) {
      params = params.set('status', opts.status);
    }
    return this.http.get<{ items: JyotishAppointment[] }>('/api/v1/jyotish/appointments', {
      params,
    });
  }

  getAppointment(id: number): Observable<JyotishAppointment> {
    return this.http.get<JyotishAppointment>(`/api/v1/jyotish/appointments/${id}`);
  }

  createAppointment(body: UpsertAppointmentRequest): Observable<JyotishAppointment> {
    return this.http.post<JyotishAppointment>('/api/v1/jyotish/appointments', body);
  }

  updateAppointment(id: number, body: UpsertAppointmentRequest): Observable<JyotishAppointment> {
    return this.http.put<JyotishAppointment>(`/api/v1/jyotish/appointments/${id}`, body);
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/jyotish/appointments/${id}`);
  }

  askAi(body: AiAskRequest): Observable<AiAskResponse> {
    return this.http.post<AiAskResponse>('/api/v1/jyotish/ai/ask', body);
  }

  getPanchang(opts: {
    date: string;
    lat: number;
    lon: number;
    timezone: string;
    placeName?: string;
    ayanamsaCode?: string;
  }): Observable<PanchangResponse> {
    let params = new HttpParams()
      .set('date', opts.date)
      .set('lat', String(opts.lat))
      .set('lon', String(opts.lon))
      .set('timezone', opts.timezone);
    if (opts.placeName) {
      params = params.set('placeName', opts.placeName);
    }
    if (opts.ayanamsaCode) {
      params = params.set('ayanamsaCode', opts.ayanamsaCode);
    }
    return this.http.get<PanchangResponse>('/api/v1/jyotish/panchang', { params });
  }

  postPanchang(body: {
    date: string;
    lat: number;
    lon: number;
    timezone: string;
    placeName?: string | null;
    ayanamsaCode?: string | null;
  }): Observable<PanchangResponse> {
    return this.http.post<PanchangResponse>('/api/v1/jyotish/panchang', body);
  }
}
