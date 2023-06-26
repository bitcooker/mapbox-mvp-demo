'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GeoJSONSource, LngLat, Map, MapboxGeoJSONFeature } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as tc from '@mapbox/tile-cover';
import * as tilebelt from '@mapbox/tilebelt';
import tileMath from 'quadkey-tilemath';
import { SixDotsScaleMiddle } from 'react-svg-spinners';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import MapboxMap from '@/components/common/map/mapbox_map';
import SearchBox from '@/components/common/searchbox/SearchBox';

const MainMap: React.FC = () => {
  const [map, setMap] = useState<Map>();
  const [takenFeatures, setTakenFeatures] = useState<MapboxGeoJSONFeature[]>(
    []
  );
  const takenFeaturesRef = useRef<MapboxGeoJSONFeature[]>([]);
  const [cursorQuadkey, setCursorQuadkey] = useState('');
  const cursorQuadkeyRef = useRef('');
  const [isMapLoading, setIsMapLoading] = useState(true);

  const flyTo = (center: LngLat) => {
    map?.flyTo({ zoom: 11, center });
  };

  const handleOnMapLoaded = (_map: Map) => {
    setIsMapLoading(false);
    setMap(_map);

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
        'line-color': 'rgba(0,255,0,1)',
        'line-width': 2,
      },
      minzoom: 10,
    });

    _map.addLayer({
      id: 'tiles-over-shade',
      source: 'tiles-over-geojson',
      type: 'fill',
      paint: {
        'fill-color': 'rgba(0,255,0,0.1)',
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
        'line-color': 'rgba(255,255,0,1)',
        'line-width': 1,
      },
      minzoom: 10,
    });

    _map.addLayer({
      id: 'tiles-selected-shade',
      source: 'tiles-selected-geojson',
      type: 'fill',
      paint: {
        'fill-color': 'rgba(255,255,0,0.7)',
      },
      minzoom: 10,
    });

    _map.on('mousemove', (e) => {
      if (_map.getZoom() > 9) {
        const _features = _map.queryRenderedFeatures(e.point, {
          layers: ['tiles-shade'],
        });
        try {
          if (_features[0].properties!.quadkey != cursorQuadkeyRef.current) {
            cursorQuadkeyRef.current = _features[0].properties!.quadkey;
            setCursorQuadkey(cursorQuadkeyRef.current);
            (_map.getSource('tiles-over-geojson') as GeoJSONSource).setData({
              type: 'FeatureCollection',
              features: [_features[0]],
            });
          }
        } catch {}
      }
    });

    _map.on('click', (e) => {
      if (_map.getZoom() > 9) {
        const _features = _map.queryRenderedFeatures(e.point, {
          layers: ['tiles-shade'],
        });

        if (e.originalEvent.ctrlKey) {
          const filteredFeatures: MapboxGeoJSONFeature[] = [];
          takenFeaturesRef.current.forEach((_takenFeature) => {
            if (
              _features[0].properties!.quadkey !=
              _takenFeature.properties!.quadkey
            ) {
              filteredFeatures.push(_takenFeature);
            }
          });
          if (filteredFeatures.length == takenFeaturesRef.current.length) {
            filteredFeatures.push(_features[0]);
          }
          takenFeaturesRef.current = filteredFeatures;
          setTakenFeatures(takenFeaturesRef.current);
        } else {
          takenFeaturesRef.current = _features;
        }

        (_map.getSource('tiles-selected-geojson') as GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: takenFeaturesRef.current,
        });
      }
    });

    const update = () => {
      if (_map.getZoom() > 10) {
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
        // geocoder.setProximity();
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
  };

  return (
    <div className='relative w-full h-full overflow-auto rounded-lg'>
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
