export type CountryStatusKind = 'been' | 'wish';

export type CountryStatusRow = {
  country_code: string;
  status: CountryStatusKind;
};
