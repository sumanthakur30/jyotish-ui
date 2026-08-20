import { Component, Input } from '@angular/core';
import { HouseDto, PlanetDto } from '../core/jyotish-api.service';

/** North-Indian style diamond chart rendered from API planet/house data (not a static image). */
@Component({
  selector: 'app-kundali-chart',
  templateUrl: './kundali-chart.component.html',
  styleUrls: ['./kundali-chart.component.scss'],
})
export class KundaliChartComponent {
  @Input() planets: PlanetDto[] = [];
  @Input() houses: HouseDto[] = [];
  @Input() ascendant: PlanetDto | null = null;

  /** Map house number → abbreviated planet labels in that house. */
  labelsForHouse(house: number): string[] {
    const labels: string[] = [];
    if (this.ascendant && this.ascendant.house === house) {
      labels.push('As');
    }
    for (const p of this.planets) {
      if (p.house === house) {
        labels.push(this.abbrev(p.planetCode) + (p.retrograde ? 'ᵣ' : ''));
      }
    }
    return labels;
  }

  signForHouse(house: number): string {
    const h = this.houses.find((x) => x.house === house);
    return h ? this.signAbbrev(h.signName) : '';
  }

  private abbrev(code: string): string {
    const map: Record<string, string> = {
      SUN: 'Su',
      MOON: 'Mo',
      MARS: 'Ma',
      MERCURY: 'Me',
      JUPITER: 'Ju',
      VENUS: 'Ve',
      SATURN: 'Sa',
      RAHU: 'Ra',
      KETU: 'Ke',
      ASCENDANT: 'As',
    };
    return map[code] || code.slice(0, 2);
  }

  private signAbbrev(name: string): string {
    const map: Record<string, string> = {
      Aries: 'Ar',
      Taurus: 'Ta',
      Gemini: 'Ge',
      Cancer: 'Cn',
      Leo: 'Le',
      Virgo: 'Vi',
      Libra: 'Li',
      Scorpio: 'Sc',
      Sagittarius: 'Sg',
      Capricorn: 'Cp',
      Aquarius: 'Aq',
      Pisces: 'Pi',
    };
    return map[name] || name.slice(0, 2);
  }
}
