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
