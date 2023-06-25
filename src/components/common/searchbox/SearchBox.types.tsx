import { LngLat } from 'mapbox-gl';

export type SearchResult = {
  text: string;
  coords: LngLat;
};
