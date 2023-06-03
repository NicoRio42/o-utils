import { TwoDRerunRoute } from "./get-2d-rerun-data-response.js";
import type { TwoDRerunTag } from "./tag.js";

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
