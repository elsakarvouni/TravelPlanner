// ένα ταξίδι όπως είναι στη βάση - auto_added_been δείχνει αν το "been to" μπήκε αυτόματα (0/1)
export type Trip = {
  id: number;
  title: string;
  destination: string;
  destination_country_code: string | null;
  destination_latitude: number | null;
  destination_longitude: number | null;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  auto_added_been: number;
};

// τα στοιχεία που δίνει ο χρήστης για να φτιάξει/επεξεργαστεί ένα ταξίδι
export type NewTrip = {
  title: string;
  destination: string;
  destination_country_code: string | null;
  destination_latitude: number | null;
  destination_longitude: number | null;
  start_date: string;
  end_date: string;
};
