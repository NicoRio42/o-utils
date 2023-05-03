export interface LoggatorCompetitor {
  id: number;
  device_id: number;
  name: string;
  marker_color: string;
  shortname: string;
  start_time: Date;
  position: number;
  end_time: number;
  club: string;
  tags: any[];
  device_battery: number;
}
