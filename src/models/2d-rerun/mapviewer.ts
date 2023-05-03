export interface Mapviewer {
  tags: Tag[];
  coursecoords: string;
  otechinfo: Record<string, any>;
  routes: TwoDRerunRoute[];
  loadseu: Loadseu;
  request_redraw: VoidFunction;
  update_routediv: VoidFunction;
  IsLive: number;
  liveprovider: string;
  liveid: string;
  liveiniturl: string;
  livedataurl: string;
  livedelay: string;
  liveupdate: number;
  liveformat: string;
  initLive: (arg0: number) => void;
}

export interface TwoDRerunRoute {
  indexnumber: number;
  runnername: string;
  latarray: number[];
  lngarray: number[];
  timearray: number[];
  splits: { index: number | null }[];
  zerotime: number;
  manualsplits: number;
  unit: string;
}

interface Loadseu {
  (baseUrl: string, coursId: string): void;
}

interface VoidFunction {
  (): void;
}

export interface Tag {
  type: string;
  opened_dialog: number;
  ready_for_dialog: number;
  runnername: string;
  points: string[];
  pointsxy: string[];
  currenttime: number;
  currentalt: number;
  totalup: number;
  show: number;
  offsettxt_x: number;
  offsettxt_y: number;
  offsettxt_basex: number;
  offsettxt_basey: number;
  group: number;
  x: number;
  y: number;
  length: number;
  name: string;
  description: string;
  color: string;
}
