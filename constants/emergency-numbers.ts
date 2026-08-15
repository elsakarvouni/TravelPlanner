export type EmergencyNumbers = {
  general?: string;
  police?: string;
  ambulance?: string;
  fire?: string;
};

// Numbers most useful to a visiting tourist. Where a country has a single
// unified emergency number it's set as `general`; otherwise the specific
// services are listed. Always double-check locally if it really matters —
// numbers do change, and this list can't cover every country.
export const EMERGENCY_NUMBERS: Record<string, EmergencyNumbers> = {
  // Europe — EU-wide 112 covers police/ambulance/fire almost everywhere.
  AL: { general: '112' },
  AD: { general: '112' },
  AT: { general: '112' },
  BE: { general: '112' },
  BA: { general: '112' },
  BG: { general: '112' },
  HR: { general: '112' },
  CY: { general: '112' },
  CZ: { general: '112' },
  DK: { general: '112' },
  EE: { general: '112' },
  FI: { general: '112' },
  FR: { general: '112' },
  DE: { general: '112' },
  GR: { general: '112' },
  HU: { general: '112' },
  IS: { general: '112' },
  IE: { general: '112' },
  IT: { general: '112' },
  XK: { general: '112' },
  LV: { general: '112' },
  LI: { general: '112' },
  LT: { general: '112' },
  LU: { general: '112' },
  MT: { general: '112' },
  MC: { general: '112' },
  ME: { general: '112' },
  NL: { general: '112' },
  MK: { general: '112' },
  NO: { general: '112' },
  PL: { general: '112' },
  PT: { general: '112' },
  RO: { general: '112' },
  SM: { general: '112' },
  RS: { general: '112' },
  SK: { general: '112' },
  SI: { general: '112' },
  ES: { general: '112' },
  SE: { general: '112' },
  CH: { general: '112' },
  UA: { general: '112' },
  VA: { general: '112' },
  TR: { general: '112' },
  RU: { general: '112' },
  GE: { general: '112' },
  AM: { general: '112' },
  AZ: { general: '112' },
  GB: { general: '999' },

  // North America
  US: { general: '911' },
  CA: { general: '911' },
  MX: { general: '911' },

  // Central America & Caribbean
  BZ: { general: '911' },
  HN: { general: '911' },
  SV: { general: '911' },
  CR: { general: '911' },
  PA: { general: '911' },
  DO: { general: '911' },
  PR: { general: '911' },
  BS: { general: '911' },
  CU: { police: '106', ambulance: '105', fire: '104' },
  JM: { police: '119', ambulance: '110', fire: '110' },
  BB: { police: '211', ambulance: '511', fire: '311' },
  TT: { general: '999', ambulance: '811', fire: '990' },

  // South America
  AR: { general: '911' },
  BR: { police: '190', ambulance: '192', fire: '193' },
  CL: { police: '133', ambulance: '131', fire: '132' },
  CO: { general: '123' },
  PE: { police: '105', ambulance: '106', fire: '116' },
  EC: { general: '911' },
  UY: { general: '911' },
  PY: { general: '911' },
  BO: { police: '110', ambulance: '118', fire: '119' },
  VE: { general: '911' },

  // Africa
  ZA: { general: '112', police: '10111' },
  EG: { police: '122', ambulance: '123', fire: '180' },
  MA: { police: '19', ambulance: '15', fire: '15' },
  KE: { general: '999' },
  TZ: { general: '112' },
  NG: { general: '112' },
  GH: { general: '112' },
  TN: { police: '197', ambulance: '190', fire: '198' },
  NA: { general: '112', police: '10111' },

  // Middle East
  AE: { police: '999', ambulance: '998', fire: '997' },
  SA: { police: '999', ambulance: '997', fire: '998' },
  IL: { police: '100', ambulance: '101', fire: '102' },
  JO: { general: '911' },
  QA: { general: '999' },
  KW: { general: '112' },
  LB: { general: '112' },

  // Asia
  CN: { police: '110', ambulance: '120', fire: '119' },
  JP: { police: '110', ambulance: '119', fire: '119' },
  KR: { police: '112', ambulance: '119', fire: '119' },
  IN: { general: '112' },
  TH: { police: '191', ambulance: '1669', fire: '199' },
  VN: { police: '113', ambulance: '115', fire: '114' },
  ID: { general: '112' },
  MY: { general: '999' },
  SG: { police: '999', ambulance: '995', fire: '995' },
  PH: { general: '911' },
  HK: { general: '999' },
  TW: { police: '110', ambulance: '119', fire: '119' },
  PK: { general: '15' },
  BD: { general: '999' },
  NP: { police: '100', ambulance: '102', fire: '101' },
  LK: { general: '119', ambulance: '110' },

  // Oceania
  AU: { general: '000' },
  NZ: { general: '111' },
  FJ: { police: '917', ambulance: '911', fire: '910' },
};

export const FALLBACK_EMERGENCY: EmergencyNumbers = { general: '112' };
