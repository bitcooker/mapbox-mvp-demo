'use client';
import React from 'react';
import Lottie from 'react-lottie-player';
import * as animationData from './map.json';

const MapAnimation: React.FC = () => {
  return (
    <div>
      <Lottie
        loop
        animationData={animationData}
        play
        style={{ width: 400, height: 300 }}
        className='mx-auto'
      />
    </div>
  );
};

export default MapAnimation;
