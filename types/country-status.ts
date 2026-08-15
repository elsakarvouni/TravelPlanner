// been = έχω πάει, wish = θέλω να πάω
export type CountryStatusKind = 'been' | 'wish';

export type CountryStatusRow = {
  country_code: string;
  status: CountryStatusKind;
};
