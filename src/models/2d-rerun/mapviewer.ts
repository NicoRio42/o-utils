import { TwoDRerunRoute } from "./get-2d-rerun-data-response.js";

export interface TwoDRerunMapviewer {
  tags: TwoDRerunTag[];
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

interface Loadseu {
  (baseUrl: string, coursId: string): void;
}

interface VoidFunction {
  (): void;
}

export interface TwoDRerunTag {
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
