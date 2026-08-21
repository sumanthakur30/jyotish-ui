import { Component, Input } from '@angular/core';
import { HouseDto, PlanetDto, TransitPlanetDto } from '../core/jyotish-api.service';
import { LanguageService } from '../core/i18n/language.service';
import { planetAbbrev, planetFull, signAbbrev } from '../core/i18n/jyotish-labels';

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
  /** Classical prints use 1–12; abbrev uses Ar/मेष style. */
  @Input() signMode: 'number' | 'abbrev' = 'number';
  /** Chart cell planet labels: short abbrev or fuller Hindi/English. */
  @Input() planetLabelMode: 'abbrev' | 'full' = 'abbrev';

  constructor(private readonly language: LanguageService) {}

  /** Map house number → abbreviated planet labels in that house. */
  labelsForHouse(house: number): string[] {
    const lang = this.language.lang;
    const labels: string[] = [];
    if (this.ascendant && this.ascendant.house === house) {
      labels.push(this.planetText('ASCENDANT'));
    }
    for (const p of this.planets) {
      if (p.house === house) {
        labels.push(this.planetText(p.planetCode) + (p.retrograde ? 'ᵣ' : ''));
      }
    }
    return labels;
  }

  transitLabelsForHouse(house: number): string[] {
    const labels: string[] = [];
    for (const p of this.transitPlanets || []) {
      if (p.house === house) {
        labels.push(this.planetText(p.planetCode) + (p.retrograde ? 'ᵣ' : ''));
      }
    }
    return labels;
  }

  signForHouse(house: number): string {
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
}
