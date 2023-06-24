'use client';

import React, { useState, useEffect } from 'react';
import { GeoJSONSource, Map } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as tc from '@mapbox/tile-cover';
import * as tilebelt from '@mapbox/tilebelt';
import tileMath from 'quadkey-tilemath';
import { SixDotsScaleMiddle } from 'react-svg-spinners';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import MapboxMap from '@/components/common/map/mapbox_map';
import { data } from '@/constants';

const Main: React.FC = () => {
  const [map, setMap] = useState<Map>();
  const [geocoder, setGeoCoder] = useState<MapboxGeocoder>();
  const [isMapLoading, setIsMapLoading] = useState(true);

  const handleOnMapLoaded = (_map: Map) => {
    setIsMapLoading(false);
    setMap(_map);

    const formattedData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: Object.keys(data).map((_quadKey) => {
        const _coords = tileMath.quadkeyToPoint(_quadKey);
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [_coords.lng, _coords.lat],
          },
          properties: {
            type: data[_quadKey].color,
          },
        };
      }),
    };

    const _geocoder = new MapboxGeocoder({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string,
    });
    map?.addControl(_geocoder);
    setGeoCoder(_geocoder);
    _map.addSource('tiles-geojson', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    _map.addSource('tiles-centers-geojson', {
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
        'line-color': [
          'case',
          ['get', 'isQuadKey'],
          ['get', 'lineColor'],
          'rgba(0, 0, 0,0)',
        ],
      },
    });

    _map.addLayer({
      id: 'tiles-shade',
      source: 'tiles-geojson',
      type: 'fill',
      paint: {
        'fill-color': [
          'case',
          ['get', 'isQuadKey'],
          ['get', 'fillColor'],
          'rgba(0,0,0,0)',
        ],
      },
    });

    _map.on('click', (e) => {
      const _features = _map.queryRenderedFeatures(e.point, {
        layers: ['tiles-shade'],
        filter: ['get', 'isQuadKey'],
      });
      if (_features[0]) {
        copyToClipboard(_features[0].properties!.quadkey);
        enqueueSnackbar(_features[0].properties!.quadkey);
      }
    });

    _map.on('mouseenter', 'tiles-shade', () => {
      _map.getCanvas().style.cursor = 'pointer';
    });
    _map.on('mouseleave', 'tiles-shade', () => {
      _map.getCanvas().style.cursor = '';
    });

    // Cluster Markers
    _map.addSource('markers', {
      type: 'geojson',
      data: formattedData,

      cluster: true,
      clusterMaxZoom: 9,
      clusterRadius: 70,
    });

    _map.addLayer({
      id: 'clusters',
      type: 'circle',
      filter: ['has', 'point_count'],
      source: 'markers',
      paint: {
        'circle-color': '#0682ff',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1,
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
      },
    });

    _map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'markers',
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

    _map.on('mouseenter', 'clusters', () => {
      _map.getCanvas().style.cursor = 'pointer';
    });
    _map.on('mouseleave', 'clusters', () => {
      _map.getCanvas().style.cursor = '';
    });

    const update = () => {
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
        min_zoom: zoom + 5,
        max_zoom: zoom + 5,
      });

      (_map.getSource('tiles-geojson') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: tiles.map(getTileFeature),
      });

      (_map.getSource('tiles-centers-geojson') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: tiles.map(getTileCenterFeature),
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
          isQuadKey: data[quadkey] != null,
          quadkey: quadkey,
          lineColor: 'rgba(0, 0, 0,0.1)',
          fillColor: data[quadkey]
            ? data[quadkey].color == 'red'
              ? 'rgba(255, 87, 87,0.7)'
              : 'rgba(0, 136, 255,0.7)'
            : 'rgba(0, 0, 0,0)',
        },
        geometry: tilebelt.tileToGeoJSON(tile),
      };
      return feature as GeoJSON.Feature<GeoJSON.Geometry>;
    }

    function getTileCenterFeature(tile: number[]) {
      const box = tilebelt.tileToBBOX(tile);
      const center = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2];

      const quadkey = tilebelt.tileToQuadkey(tile);
      return {
        type: 'Feature',
        properties: {
          text:
            data[quadkey] != null
              ? 'Tile: ' +
                JSON.stringify(tile) +
                '\nQuadkey: ' +
                quadkey +
                '\nZoom: ' +
                tile[2]
              : '',
          quadkey: quadkey,
        },
        geometry: {
          type: 'Point',
          coordinates: center,
        },
      } as GeoJSON.Feature<GeoJSON.Geometry>;
    }

    update();
    _map.on('moveend', update);
  };

  function copyToClipboard(str: string) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  return (
    <div className='relative w-full h-screen '>
      {isMapLoading && (
        <div className='absolute flex items-center justify-center w-screen h-screen'>
          <SixDotsScaleMiddle width={40} height={40} />
        </div>
      )}
      <MapboxMap onMapLoaded={handleOnMapLoaded} />
      <SnackbarProvider />
    </div>
  );
};

export default Main;
