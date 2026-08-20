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
  marsHouse: number;
  marsSignIndex: number;
  marsSignName: string;
  relevantHouses: number[];
  reasoning: string;
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
}
