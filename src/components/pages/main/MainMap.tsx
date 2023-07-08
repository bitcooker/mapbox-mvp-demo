'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GeoJSONSource, LngLat, Map, MapboxGeoJSONFeature } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as tc from '@mapbox/tile-cover';
import * as tilebelt from '@mapbox/tilebelt';
import tileMath from 'quadkey-tilemath';
import { SixDotsScaleMiddle } from 'react-svg-spinners';
import MapboxMap from '@/components/core/map/MapboxMap';
import SearchBox from '@/components/core/searchbox/SearchBox';

interface IProps {
  onSelectedFeaturesChanged(selectedFeatures: MapboxGeoJSONFeature[]): void;
  onMapLoaded(): void;
  selectedFeatures: MapboxGeoJSONFeature[];
  propertyFeatures: GeoJSON.FeatureCollection;
  propertyQuadkeys: string[];
}
const MainMap: React.FC<IProps> = ({
  onSelectedFeaturesChanged,
  onMapLoaded,
  selectedFeatures,
  propertyFeatures,
  propertyQuadkeys,
}) => {
  const [map, setMap] = useState<Map | null>(null);
  const takenFeaturesRef = useRef<MapboxGeoJSONFeature[]>([]);
  const cursorQuadkeyRef = useRef('');
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    if (map != null) {
      (map?.getSource('tiles-selected-geojson') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: selectedFeatures,
      });
    }
  }, [selectedFeatures]);

  useEffect(() => {
    if (map != null) {
      (map?.getSource('tiles-properties-geojson') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: propertyFeatures.features,
      });
    }
  }, [propertyFeatures]);

  useEffect(() => {
    if (map != null && propertyQuadkeys.length > 0) {
      const _features = propertyQuadkeys.map((_quadkey) => {
        const _coords = tileMath.quadkeyToPoint(_quadkey);
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [_coords.lng, _coords.lat],
          },
          properties: {},
        } as MapboxGeoJSONFeature;
      });
      const clusterData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: _features,
      };
      (map.getSource('clusters-geojson') as GeoJSONSource).setData(clusterData);
    }
  }, [propertyQuadkeys]);

  const flyTo = (center: LngLat) => {
    map?.flyTo({ zoom: 11, center });
  };

  const handleOnMapLoaded = (_map: Map) => {
    const _geocoder = new MapboxGeocoder({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string,
    });
    map?.addControl(_geocoder);

    // Quadkey Grids
    _map.addSource('tiles-geojson', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    _map.addLayer({
      id: 'tiles',
      source: 'tiles-geojson',
      type: 'line',
      paint: {
        'line-color': 'rgba(0,0,0,0.2)',
        'line-width': 0.5,
      },
      minzoom: 10,
    });

    _map.addLayer({
      id: 'tiles-shade',
      source: 'tiles-geojson',
      type: 'fill',
      paint: {
        'fill-color': 'rgba(0,0,0,0)',
      },
      minzoom: 10,
    });

    // Mouse Over Quadkeys
    _map.addSource('tiles-over-geojson', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    _map.addLayer({
      id: 'tiles-over',
      source: 'tiles-over-geojson',
      type: 'line',
      paint: {
        'line-color': [
          'case',
          ['has', 'color'],
          ['get', 'color'],
          'rgb(0,255,0)',
        ],
        'line-width': 2,
        'line-opacity': ['case', ['has', 'color'], 1, 0.9],
      },
      minzoom: 10,
    });

    _map.addLayer({
      id: 'tiles-over-shade',
      source: 'tiles-over-geojson',
      type: 'fill',
      paint: {
        'fill-color': [
          'case',
          ['has', 'color'],
          ['get', 'color'],
          'rgb(0,255,0)',
        ],
        'fill-opacity': ['case', ['has', 'color'], 0.8, 0.5],
      },
      minzoom: 10,
    });

    // Mouse Click QuadKeys
    _map.addSource('tiles-selected-geojson', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    _map.addLayer({
      id: 'tiles-selected',
      source: 'tiles-selected-geojson',
      type: 'line',
      paint: {
        'line-color': [
          'case',
          ['has', 'color'],
          ['get', 'color'],
          'rgb(255,255,0)',
        ],
        'line-width': 2,
        'line-opacity': ['case', ['has', 'color'], 1, 1],
      },
      minzoom: 10,
    });

    _map.addLayer({
      id: 'tiles-selected-shade',
      source: 'tiles-selected-geojson',
      type: 'fill',
      paint: {
        'fill-color': [
          'case',
          ['has', 'color'],
          ['get', 'color'],
          'rgb(255,255,0)',
        ],
        'fill-opacity': ['case', ['has', 'color'], 0.9, 0.7],
      },
      minzoom: 10,
    });

    // Property Quadkeys
    _map.addSource('tiles-properties-geojson', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    _map.addLayer({
      id: 'tiles-properties',
      source: 'tiles-properties-geojson',
      type: 'line',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1,
        'line-opacity': 0.6,
      },
      minzoom: 8,
    });

    _map.addLayer({
      id: 'tiles-properties-shade',
      source: 'tiles-properties-geojson',
      type: 'fill',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.3,
      },
      minzoom: 8,
    });

    // Cluster Markers
    _map.addSource('clusters-geojson', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
      cluster: true,
      clusterMaxZoom: 9,
      clusterRadius: 70,
    });

    _map.addLayer({
      id: 'clusters-circle',
      type: 'circle',
      source: 'clusters-geojson',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#0682ff',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1,
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
      },
    });

    _map.addLayer({
      id: 'unclustered-circle',
      type: 'circle',
      source: 'clusters-geojson',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#0682ff',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1,
        'circle-radius': 6,
      },
      maxzoom: 8,
    });

    _map.addLayer({
      id: 'clusters-count',
      type: 'symbol',
      source: 'clusters-geojson',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 16,
      },
      paint: {
        'text-color': '#ffffff',
      },
    });

    _map.on('mouseenter', 'clusters-circle', () => {
      _map.getCanvas().style.cursor = 'pointer';
    });
    _map.on('mouseleave', 'clusters-circle', () => {
      _map.getCanvas().style.cursor = '';
    });

    _map.on('mousemove', (e) => {
      if (_map.getZoom() > 9) {
        _map.getCanvas().style.cursor = 'pointer';
        const _propertyFeatures = _map.queryRenderedFeatures(e.point, {
          layers: ['tiles-properties-shade'],
        });
        if (_propertyFeatures.length > 0) {
          try {
            if (
              _propertyFeatures[0].properties!.quadkey !=
              cursorQuadkeyRef.current
            ) {
              cursorQuadkeyRef.current =
                _propertyFeatures[0].properties!.quadkey;
              (_map.getSource('tiles-over-geojson') as GeoJSONSource).setData({
                type: 'FeatureCollection',
                features: [_propertyFeatures[0]],
              });
            }
          } catch {}
        } else {
          const _availableFeatures = _map.queryRenderedFeatures(e.point, {
            layers: ['tiles-shade'],
          });
          try {
            if (
              _availableFeatures[0].properties!.quadkey !=
              cursorQuadkeyRef.current
            ) {
              cursorQuadkeyRef.current =
                _availableFeatures[0].properties!.quadkey;
              (_map.getSource('tiles-over-geojson') as GeoJSONSource).setData({
                type: 'FeatureCollection',
                features: [_availableFeatures[0]],
              });
            }
          } catch {}
        }
      }
    });

    _map.on('click', (e) => {
      if (_map.getZoom() > 9) {
        const _propertyFeatures = _map.queryRenderedFeatures(e.point, {
          layers: ['tiles-properties-shade'],
        });
        if (_propertyFeatures.length > 0) {
          takenFeaturesRef.current = _propertyFeatures;
          console.log(_propertyFeatures);
          onSelectedFeaturesChanged(takenFeaturesRef.current);
        } else {
          const _availableFeatures = _map.queryRenderedFeatures(e.point, {
            layers: ['tiles-shade'],
          });

          if (e.originalEvent.ctrlKey || e.originalEvent.shiftKey) {
            if (
              takenFeaturesRef.current.length == 1 &&
              takenFeaturesRef.current[0].properties!.color != null
            ) {
              takenFeaturesRef.current = [];
            }
            const filteredFeatures: MapboxGeoJSONFeature[] = [];
            takenFeaturesRef.current.forEach((_takenFeature) => {
              if (
                _availableFeatures[0].properties!.quadkey !=
                _takenFeature.properties!.quadkey
              ) {
                filteredFeatures.push(_takenFeature);
              }
            });
            if (filteredFeatures.length == takenFeaturesRef.current.length) {
              filteredFeatures.push(_availableFeatures[0]);
            }
            takenFeaturesRef.current = filteredFeatures;
            onSelectedFeaturesChanged(takenFeaturesRef.current);
          } else {
            takenFeaturesRef.current = _availableFeatures;
            onSelectedFeaturesChanged(takenFeaturesRef.current);
          }
        }
      }
    });

    _map.on('click', 'clusters-circle', (e) => {
      const _features = _map.queryRenderedFeatures(e.point, {
        layers: ['clusters-circle'],
      });
      const _clusterId = _features[0].properties!.cluster_id;
      (
        _map.getSource('clusters-geojson') as GeoJSONSource
      ).getClusterExpansionZoom(_clusterId, (err, zoom) => {
        if (err) return;

        _map.easeTo({
          center: (_features[0] as any).geometry!.coordinates,
          zoom: zoom,
        });
      });
    });

    const update = () => {
      if (_map.getZoom() >= 9) {
        _map.getCanvas().style.cursor = 'pointer';
      } else {
        _map.getCanvas().style.cursor = '';
      }
      updateGeocoderProximity();
      updateTiles();
    };

    function updateGeocoderProximity() {
      if (_map.getZoom() > 9) {
        var center = _map.getCenter().wrap();
        _geocoder.setProximity({
          longitude: center.lng,
          latitude: center.lat,
        });
      } else {
        (_geocoder as any).setProximity();
      }
    }

    function updateTiles() {
      const extentsGeom = getExtentsGeom();
      const zoom = Math.ceil(_map.getZoom());
      const tiles = tc.tiles(extentsGeom, {
        min_zoom: zoom > 9 ? 15 : 1,
        max_zoom: zoom > 9 ? 15 : 1,
      });

      (_map.getSource('tiles-geojson') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: tiles.map(getTileFeature),
      });
    }

    function getExtentsGeom() {
      const e = _map.getBounds();
      const box = [
        e.getSouthWest().toArray(),
        e.getNorthWest().toArray(),
        e.getNorthEast().toArray(),
        e.getSouthEast().toArray(),
        e.getSouthWest().toArray(),
      ].map((coords) => {
        if (coords[0] < -180) return [-179.99999, coords[1]];
        if (coords[0] > 180) return [179.99999, coords[1]];
        return coords;
      });

      return {
        type: 'Polygon',
        coordinates: [box],
      } as GeoJSON.Geometry;
    }

    function getTileFeature(tile: number[]) {
      const quadkey = tilebelt.tileToQuadkey(tile);
      const feature = {
        type: 'Feature',
        properties: {
          quadkey: quadkey,
        },
        geometry: tilebelt.tileToGeoJSON(tile),
      };
      return feature as GeoJSON.Feature<GeoJSON.Geometry>;
    }

    update();
    _map.on('moveend', update);

    setIsMapLoading(false);
    setMap(_map);
    onMapLoaded();
  };

  return (
    <div className='relative h-full rounded-lg'>
      {isMapLoading && (
        <div className='absolute flex items-center justify-center w-full h-full'>
          <SixDotsScaleMiddle width={40} height={40} />
        </div>
      )}
      <MapboxMap onMapLoaded={handleOnMapLoaded} />
      <SearchBox flyTo={flyTo} />
    </div>
  );
};

export default MainMap;
