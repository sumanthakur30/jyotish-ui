import { Lang } from '../i18n/language.service';

const PLANET_EN: Record<string, string> = {
  SUN: 'Su',
  MOON: 'Mo',
  MARS: 'Ma',
  MERCURY: 'Me',
  JUPITER: 'Ju',
  VENUS: 'Ve',
  SATURN: 'Sa',
  RAHU: 'Ra',
  KETU: 'Ke',
  URANUS: 'Ur',
  NEPTUNE: 'Ne',
  PLUTO: 'Pl',
  ASCENDANT: 'As',
};

const PLANET_HI: Record<string, string> = {
  SUN: 'सू',
  MOON: 'चं',
  MARS: 'मं',
  MERCURY: 'बु',
  JUPITER: 'गु',
  VENUS: 'शु',
  SATURN: 'श',
  RAHU: 'रा',
  KETU: 'के',
  URANUS: 'यू',
  NEPTUNE: 'ने',
  PLUTO: 'प्ल',
  ASCENDANT: 'ल',
};

const PLANET_FULL_EN: Record<string, string> = {
  SUN: 'Sun',
  MOON: 'Moon',
  MARS: 'Mars',
  MERCURY: 'Mercury',
  JUPITER: 'Jupiter',
  VENUS: 'Venus',
  SATURN: 'Saturn',
  RAHU: 'Rahu',
  KETU: 'Ketu',
  URANUS: 'Uranus',
  NEPTUNE: 'Neptune',
  PLUTO: 'Pluto',
  ASCENDANT: 'Lagna',
};

const PLANET_FULL_HI: Record<string, string> = {
  SUN: 'सूर्य',
  MOON: 'चंद्र',
  MARS: 'मंगल',
  MERCURY: 'बुध',
  JUPITER: 'गुरु',
  VENUS: 'शुक्र',
  SATURN: 'शनि',
  RAHU: 'राहु',
  KETU: 'केतु',
  URANUS: 'यूरेनस',
  NEPTUNE: 'नेपच्यून',
  PLUTO: 'प्लूटो',
  ASCENDANT: 'लग्न',
};

const SIGN_EN: Record<string, string> = {
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

/** Short forms for chart cells (keep off the diamond lines). */
const SIGN_HI: Record<string, string> = {
  Aries: 'मेष',
  Taurus: 'वृष',
  Gemini: 'मिथु',
  Cancer: 'कर्क',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तुला',
  Scorpio: 'वृश्च',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुंभ',
  Pisces: 'मीन',
};

const SIGN_FULL_HI: Record<string, string> = {
  Aries: 'मेष',
  Taurus: 'वृषभ',
  Gemini: 'मिथुन',
  Cancer: 'कर्क',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तुला',
  Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुंभ',
  Pisces: 'मीन',
};

export function planetAbbrev(code: string, lang: Lang): string {
  const map = lang === 'hi' ? PLANET_HI : PLANET_EN;
  return map[code] || code.slice(0, 2);
}

export function planetFull(code: string, lang: Lang): string {
  const map = lang === 'hi' ? PLANET_FULL_HI : PLANET_FULL_EN;
  return map[code] || code;
}

export function signAbbrev(name: string, lang: Lang): string {
  const map = lang === 'hi' ? SIGN_HI : SIGN_EN;
  return map[name] || name.slice(0, 2);
}

export function signFull(name: string, lang: Lang): string {
  if (lang === 'hi') {
    return SIGN_FULL_HI[name] || name;
  }
  return name;
}

const YOGA_HI: Record<string, string> = {
  GAJAKESARI: 'गजकेसरी योग',
  DHARMA_KARMADHIPATI: 'धर्म-कर्माधिपति राज योग',
  DHANA_2_11: 'धन योग (द्वितीय–एकादश)',
  RUCHAKA: 'रुचक योग',
  BHADRA: 'भद्र योग',
  HAMSA: 'हंस योग',
  MALAVYA: 'मालव्य योग',
  SASA: 'शश योग',
  NEECHA_BHANGA: 'नीच भंग राज योग',
  VIPARITA_RAJA: 'विपरीत राज योग',
  KEMADRUMA: 'केमद्रुम योग',
  BUDHADITYA: 'बुधादित्य योग',
};

const YOGA_CAT_HI: Record<string, string> = {
  CHANDRA: 'चंद्र योग',
  RAJA: 'राज योग',
  DHANA: 'धन योग',
  MAHAPURUSHA: 'पंच महापुरुष',
  OTHER: 'अन्य योग',
};

const YOGA_CAT_EN: Record<string, string> = {
  CHANDRA: 'Chandra Yoga',
  RAJA: 'Raja Yoga',
  DHANA: 'Dhana Yoga',
  MAHAPURUSHA: 'Panch Mahapurusha',
  OTHER: 'Other Yogas',
};

export function yogaNameHi(code: string): string {
  return YOGA_HI[code] || code;
}

export function yogaCategoryLabel(code: string, lang: Lang): string {
  const map = lang === 'hi' ? YOGA_CAT_HI : YOGA_CAT_EN;
  return map[code] || code;
}

const SIGN_LORD: Record<string, string> = {
  Aries: 'MARS',
  Taurus: 'VENUS',
  Gemini: 'MERCURY',
  Cancer: 'MOON',
  Leo: 'SUN',
  Virgo: 'MERCURY',
  Libra: 'VENUS',
  Scorpio: 'MARS',
  Sagittarius: 'JUPITER',
  Capricorn: 'SATURN',
  Aquarius: 'SATURN',
  Pisces: 'JUPITER',
};

const NAK_LORDS = [
  'KETU',
  'VENUS',
  'SUN',
  'MOON',
  'MARS',
  'RAHU',
  'JUPITER',
  'SATURN',
  'MERCURY',
];

export function signLordCode(signName: string): string | null {
  return SIGN_LORD[signName] || null;
}

export function nakshatraLordCode(nakshatraIndex: number): string {
  return NAK_LORDS[((nakshatraIndex % 9) + 9) % 9];
}
