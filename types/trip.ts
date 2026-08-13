export type Trip = {
  id: number;
  title: string;
  destination: string;
  destination_country_code: string | null;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  auto_added_been: number;
};

export type NewTrip = {
  title: string;
  destination: string;
  destination_country_code: string | null;
  start_date: string;
  end_date: string;
};
