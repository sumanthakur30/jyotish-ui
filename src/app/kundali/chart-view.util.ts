import { HouseDto, PlanetDto } from '../core/jyotish-api.service';

const SIGN_NAMES = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

export type ChartViewMode = 'LAGNA' | 'CHANDRA' | 'SURYA';

export interface ChartView {
  mode: ChartViewMode;
  planets: PlanetDto[];
  houses: HouseDto[];
  ascendant: PlanetDto | null;
  pivotLabel: string;
}

/** Remap whole-sign houses so pivot planet's natal house becomes house 1 (Chandra/Surya Kundli). */
export function buildChartView(
  mode: ChartViewMode,
  planets: PlanetDto[],
  houses: HouseDto[],
  ascendant: PlanetDto | null
): ChartView {
  if (mode === 'LAGNA') {
    return { mode, planets, houses, ascendant, pivotLabel: 'Lagna' };
  }
  const code = mode === 'CHANDRA' ? 'MOON' : 'SUN';
  const pivot = planets.find((p) => p.planetCode === code);
  if (!pivot) {
    return { mode: 'LAGNA', planets, houses, ascendant, pivotLabel: 'Lagna' };
  }

  const pivotHouse = pivot.house;
  const pivotSignIndex = pivot.signIndex;

  const remappedPlanets: PlanetDto[] = planets.map((p) => ({
    ...p,
    house: rotateHouse(p.house, pivotHouse),
  }));

  const remappedHouses: HouseDto[] = [];
  for (let h = 1; h <= 12; h++) {
    const signIndex = (pivotSignIndex + h - 1) % 12;
    const natalHouse = houses.find((x) => x.signIndex === signIndex);
    remappedHouses.push({
      house: h,
      signIndex,
      signName: SIGN_NAMES[signIndex],
      cuspLongitudeDeg: natalHouse?.cuspLongitudeDeg ?? signIndex * 30,
    });
  }

  const remappedAsc: PlanetDto = {
    ...pivot,
    planetCode: 'ASCENDANT',
    planetName: mode === 'CHANDRA' ? 'Moon Lagna' : 'Sun Lagna',
    house: 1,
  };

  return {
    mode,
    planets: remappedPlanets,
    houses: remappedHouses,
    ascendant: remappedAsc,
    pivotLabel: mode === 'CHANDRA' ? 'Chandra' : 'Surya',
  };
}

function rotateHouse(natalHouse: number, pivotHouse: number): number {
  return ((natalHouse - pivotHouse + 12) % 12) + 1;
}
