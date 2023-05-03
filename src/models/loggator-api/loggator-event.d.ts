import { LoggatorCompetitor } from "./loggator-competitor.js";

export interface LoggatorEvent {
  event: {
    id: number;
    name: string;
    start_date: Date;
    end_date: Date;
    publish_date: Date;
    map_id: number;
    slug: string;
  };
  competitors: LoggatorCompetitor[];
  tracks: URL;
  settings: {
    latitude: number;
    longitude: number;
    zoom: number;
    tail_length: number;
    replay_speed: number;
    live_delay: number;
    publish_competitors: number;
    show_battery_info: number;
    show_distance_info: number;
    show_relative_time: number;
  };
  map: {
    url: URL;
    width: number;
    height: number;
    coordinates: {
      bottomLeft: { lat: number; lng: number };
      bottomRight: { lat: number; lng: number };
      topRight: { lat: number; lng: number };
      topLeft: { lat: number; lng: number };
    };
    tiles: URL;
    name: string;
  };
}
