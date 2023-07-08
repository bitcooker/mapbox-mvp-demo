'use client';

import React, { useState, useEffect } from 'react';
import { Map, MapboxOptions } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface IProps {
  initialOptions?: Omit<MapboxOptions, 'container'>;
  onMapLoaded?(map: Map): void;
  onMapRemoved?(): void;
}

const MapboxMap: React.FC<IProps> = ({
  initialOptions = {},
  onMapLoaded,
  onMapRemoved,
}) => {
  const [map, setMap] = useState<Map>();
  const mapNode = React.useRef(null);
  useEffect(() => {
    const node = mapNode.current;
    if (typeof window === 'undefined' || node === null) return;
    const mapboxMap = new Map({
      container: node,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 3,
      minZoom: 2,
      ...initialOptions,
    });

    setMap(mapboxMap);
    if (onMapLoaded) mapboxMap.on('load', () => handleOnMapLoaded(mapboxMap));

    return () => {
      mapboxMap.remove();
      if (onMapRemoved) onMapRemoved();
    };
  }, []);

  const handleOnMapLoaded = (_map: Map) => {
    if (onMapLoaded) onMapLoaded(_map);
  };
  return <div ref={mapNode} style={{ width: '100%', height: '100%' }}></div>;
};

export default MapboxMap;
