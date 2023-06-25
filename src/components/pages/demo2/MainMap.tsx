'use client';

import React, { useState } from 'react';
import { LngLatLike, Map } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { SixDotsScaleMiddle } from 'react-svg-spinners';
import MapboxMap from '@/components/common/map/mapbox_map';
import SearchBox from '@/components/common/searchbox/SearchBox';

const MainMap: React.FC = () => {
  const [map, setMap] = useState<Map>();
  const [isMapLoading, setIsMapLoading] = useState(true);

  const flyTo = (center: LngLatLike) => {
    map?.flyTo({ zoom: 15, center });
  };

  const handleOnMapLoaded = (_map: Map) => {
    setIsMapLoading(false);
    setMap(_map);

    const _geocoder = new MapboxGeocoder({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string,
    });
    map?.addControl(_geocoder);
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
