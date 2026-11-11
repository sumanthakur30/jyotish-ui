import { Component, Input } from '@angular/core';
import { HouseDto, PlanetDto, TransitPlanetDto } from '../core/jyotish-api.service';
import { LanguageService } from '../core/i18n/language.service';
import { planetAbbrev, planetFull, signAbbrev } from '../core/i18n/jyotish-labels';

/**
 * Classical North Indian diamond (Hindi printout convention):
 * house 1 = top kite; houses increase anti-clockwise (2 at top-left, 12 at top-right).
 * Sign numbers sit on outer corners; graha names sit in the house interior.
 */
const GRAHA_ORDER = [
  'ASCENDANT',
  'SUN',
  'MOON',
  'MARS',
  'MERCURY',
  'JUPITER',
  'VENUS',
  'SATURN',
  'RAHU',
  'KETU',
  'URANUS',
  'NEPTUNE',
  'PLUTO',
];

/**
 * viewBox 400×400. Sign number at the outer vertex; graha names at the house centroid.
 * Anti-clockwise from H1 (matches printed लग्न कुंडली): H2 top-left … H12 top-right.
 */
const HOUSE_SLOTS: { house: number; nx: number; ny: number; lx: number; ly: number }[] = [
  { house: 1, nx: 200, ny: 36, lx: 200, ly: 118 },
  { house: 2, nx: 48, ny: 22, lx: 92, ly: 52 },
  { house: 3, nx: 22, ny: 92, lx: 52, ly: 108 },
  { house: 4, nx: 42, ny: 200, lx: 92, ly: 200 },
  { house: 5, nx: 22, ny: 308, lx: 52, ly: 292 },
  { house: 6, nx: 48, ny: 378, lx: 92, ly: 348 },
  { house: 7, nx: 200, ny: 364, lx: 200, ly: 282 },
  { house: 8, nx: 352, ny: 378, lx: 308, ly: 348 },
  { house: 9, nx: 378, ny: 308, lx: 348, ly: 292 },
  { house: 10, nx: 358, ny: 200, lx: 308, ly: 200 },
  { house: 11, nx: 378, ny: 92, lx: 348, ly: 108 },
  { house: 12, nx: 352, ny: 22, lx: 308, ly: 52 },
];

export interface NiHouseRender {
  house: number;
  sign: string;
  nx: number;
  ny: number;
  lx: number;
  ly: number;
  lines: string[];
  transitLines: string[];
}

@Component({
  selector: 'app-kundali-chart',
  templateUrl: './kundali-chart.component.html',
  styleUrls: ['./kundali-chart.component.scss'],
})
export class KundaliChartComponent {
  @Input() planets: PlanetDto[] = [];
  @Input() houses: HouseDto[] = [];
  @Input() ascendant: PlanetDto | null = null;
  @Input() transitPlanets: TransitPlanetDto[] = [];
  @Input() signMode: 'number' | 'abbrev' = 'number';
  @Input() planetLabelMode: 'abbrev' | 'full' = 'abbrev';
  @Input() compact = false;
  @Input() caption = '';

  constructor(private readonly language: LanguageService) {}

  trackHouse(_index: number, h: NiHouseRender): number {
    return h.house;
  }

  houseRenders(): NiHouseRender[] {
    return HOUSE_SLOTS.map((slot) => ({
      ...slot,
      sign: this.signForHouse(slot.house),
      lines: this.chunk(this.labelsForHouse(slot.house), this.planetLabelMode === 'full' ? 2 : 3),
      transitLines: this.chunk(
        this.transitLabelsForHouse(slot.house),
        this.planetLabelMode === 'full' ? 2 : 3
      ),
    }));
  }

  private labelsForHouse(house: number): string[] {
    const items: { code: string; text: string }[] = [];
    if (this.ascendant && this.ascendant.house === house) {
      items.push({ code: 'ASCENDANT', text: this.planetText('ASCENDANT') });
    }
    for (const p of this.planets) {
      if (p.house === house) {
        items.push({
          code: p.planetCode,
          text: this.planetText(p.planetCode) + (p.retrograde ? 'ᵣ' : ''),
        });
      }
    }
    return this.sortGraha(items);
  }

  private transitLabelsForHouse(house: number): string[] {
    const items: { code: string; text: string }[] = [];
    for (const p of this.transitPlanets || []) {
      if (p.house === house) {
        items.push({
          code: p.planetCode,
          text: this.planetText(p.planetCode) + (p.retrograde ? 'ᵣ' : ''),
        });
      }
    }
    return this.sortGraha(items);
  }

  private signForHouse(house: number): string {
    const h = this.houses.find((x) => x.house === house);
    if (!h) {
      return '';
    }
    if (this.signMode === 'number') {
      return String((h.signIndex % 12) + 1);
    }
    return signAbbrev(h.signName, this.language.lang);
  }

  private planetText(code: string): string {
    const lang = this.language.lang;
    if (this.planetLabelMode === 'full' && lang === 'hi') {
      return planetFull(code, 'hi');
    }
    return planetAbbrev(code, lang);
  }

  private sortGraha(items: { code: string; text: string }[]): string[] {
    return items
      .slice()
      .sort((a, b) => {
        const ia = GRAHA_ORDER.indexOf(a.code);
        const ib = GRAHA_ORDER.indexOf(b.code);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      })
      .map((x) => x.text);
  }

  private chunk(labels: string[], size: number): string[] {
    const lines: string[] = [];
    for (let i = 0; i < labels.length; i += size) {
      lines.push(labels.slice(i, i + size).join(' '));
    }
    return lines;
  }
}
