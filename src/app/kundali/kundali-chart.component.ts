import { Component, Input } from '@angular/core';
import { HouseDto, PlanetDto, TransitPlanetDto } from '../core/jyotish-api.service';
import { LanguageService } from '../core/i18n/language.service';
import { planetAbbrev, signAbbrev } from '../core/i18n/jyotish-labels';

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
  /** Optional Gochar overlay — shown with a distinct style in natal houses. */
  @Input() transitPlanets: TransitPlanetDto[] = [];

  constructor(private readonly language: LanguageService) {}

  /** Map house number → abbreviated planet labels in that house. */
  labelsForHouse(house: number): string[] {
    const lang = this.language.lang;
    const labels: string[] = [];
    if (this.ascendant && this.ascendant.house === house) {
      labels.push(planetAbbrev('ASCENDANT', lang));
    }
    for (const p of this.planets) {
      if (p.house === house) {
        labels.push(planetAbbrev(p.planetCode, lang) + (p.retrograde ? 'ᵣ' : ''));
      }
    }
    return labels;
  }

  transitLabelsForHouse(house: number): string[] {
    const lang = this.language.lang;
    const labels: string[] = [];
    for (const p of this.transitPlanets || []) {
      if (p.house === house) {
        labels.push(planetAbbrev(p.planetCode, lang) + (p.retrograde ? 'ᵣ' : ''));
      }
    }
    return labels;
  }

  signForHouse(house: number): string {
    const h = this.houses.find((x) => x.house === house);
    return h ? signAbbrev(h.signName, this.language.lang) : '';
  }
}
