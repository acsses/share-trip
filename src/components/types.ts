export type TimeTable = {
  hour?: string;
  minutes?: { minutes: string; name: string; link: string }[];
}[];

export type changes = {
  id:number
  name?: string;
  start?: {
    date: string;
    time: string;

    latitude?: number;
    longitude?: number;
  };
  end?: {
    date: string;
    time: string;

    latitude?: number;
    longitude?: number;
  };
  selected?: any;
  geometry?:geometry;
  kind?: string;
};

export type geometry = {
  type: string;
  bbox?: [number, number, number, number];
  coordinates?: number[][] | number[];
};

export type Trip = {
  id: number;
  type: string;
  name: string;
  start: {
    date: string;
    time: string;

    latitude?: number;
    longitude?: number;
  };
  end: {
    date: string;
    time: string;

    latitude?: number;
    longitude?: number;
  };
  selected?:any;
  geometry?:geometry;
  kind?: string;
  editable?: boolean;
  href?: string; // Added href to Trip type
};

export type header = {
  season: string;
  month: string;
  day: string;
  destination: string;
  travelType: string;

  name: string;
};

export type Journy = {
  id: number;
  trips: Trip[];
  header?: header;
};