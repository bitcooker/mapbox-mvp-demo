'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { SnackbarProvider } from 'notistack';
import { LngLat, MapboxGeoJSONFeature } from 'mapbox-gl';
import { query, collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/libs/firebase/firebase';
import { OneEightyRing } from 'react-svg-spinners';
import { SketchPicker, Color, ColorResult } from 'react-color';
import * as tilebelt from '@mapbox/tilebelt';
import tileMath from 'quadkey-tilemath';
import dayjs from 'dayjs';
import { useAuth } from '@/libs/firebase/auth';
import { signInWithGoogleHandler } from '@/libs/firebase/authentication';
import Property from '@/models/Property';
import { submitProperty } from '@/libs/firebase/property.firestore';
import { getFeaturesFromCoords } from '@/libs/api/mapbox';
import MainMap from '@/components/pages/main/MainMap';
import Button from '@/components/common/button/Button';

export default function MainPage() {
  const [selectedFeatures, setSelectedFeatures] = useState<
    MapboxGeoJSONFeature[]
  >([]);
  const [propertyFeatures, setPropertyFeatures] =
    useState<GeoJSON.FeatureCollection>({
      type: 'FeatureCollection',
      features: [],
    });
  const [propertyQuadkeys, setPropertyQuadkeys] = useState<string[]>([]);
  const [color, setColor] = useState<Color>('#fff');
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [infoProperty, setInfoProperty] = useState<Property | null>(null);
  const [infoAddress, setInfoAddress] = useState('-');
  const [infoCoords, setInfoCoords] = useState('-');
  const mapLoadedRef = useRef(false);
  const [panelMode, setPanelMode] = useState('EDIT_MODE');
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'properties'));
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      if (mapLoadedRef.current) {
        const _propertyFeatures: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [],
        };
        const _propertyQuadkeys: string[] = [];
        QuerySnapshot.forEach((doc) => {
          const _property = doc.data();
          const _propertyFeature = {
            type: 'Feature',
            geometry: tilebelt.tileToGeoJSON(
              tilebelt.quadkeyToTile(_property.quadkey)
            ),
            properties: {
              quadkey: _property.quadkey,
              color: _property.color,
              comment: _property.comment,
              uidUser: _property.uidUser,
              displayName: _property.displayName,
              photoURL: _property.photoURL,
              createdAt: _property.createdAt.seconds,
            },
          } as GeoJSON.Feature<GeoJSON.Geometry>;
          _propertyFeatures.features.push(_propertyFeature);
          _propertyQuadkeys.push(_property.quadkey);
        });
        setPropertyFeatures(_propertyFeatures);
        setPropertyQuadkeys(_propertyQuadkeys);
      }
    });
    return unsubscribe;
  }, []);

  const handleOnMapLoaded = async () => {
    mapLoadedRef.current = true;
    const docs = await getDocs(query(collection(db, 'properties')));
    const _propertyFeatures: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };
    const _propertyQuadkeys: string[] = [];
    docs.forEach((doc) => {
      const _property = doc.data();
      const _propertyFeature = {
        type: 'Feature',
        geometry: tilebelt.tileToGeoJSON(
          tilebelt.quadkeyToTile(_property.quadkey)
        ),
        properties: {
          quadkey: _property.quadkey,
          color: _property.color,
          comment: _property.comment,
          uidUser: _property.uidUser,
          displayName: _property.displayName,
          photoURL: _property.photoURL,
          createdAt: _property.createdAt.seconds,
        },
      } as GeoJSON.Feature<GeoJSON.Geometry>;
      _propertyFeatures.features.push(_propertyFeature);
      _propertyQuadkeys.push(_property.quadkey);
    });
    setPropertyFeatures(_propertyFeatures);
    setPropertyQuadkeys(_propertyQuadkeys);
  };

  const handleOnSelectedFeaturesChanged = async (
    _selectedFeatures: MapboxGeoJSONFeature[]
  ) => {
    setSelectedFeatures(_selectedFeatures);
    if (
      _selectedFeatures.length == 1 &&
      _selectedFeatures[0].properties!.color != null
    ) {
      const _infoProperty: Property = {
        quadkey: _selectedFeatures[0].properties!.quadkey,
        color: _selectedFeatures[0].properties!.color,
        comment: _selectedFeatures[0].properties!.comment,
        uidUser: _selectedFeatures[0].properties!.uidUser,
        displayName: _selectedFeatures[0].properties!.displayName,
        photoURL: _selectedFeatures[0].properties!.photoURL,
        createdAt: new Date(
          parseInt(_selectedFeatures[0].properties!.createdAt) * 1000
        ),
        updatedAt: null,
      };
      setInfoProperty(_infoProperty);

      const _coords = tileMath.quadkeyToPoint(
        _selectedFeatures[0].properties!.quadkey
      ) as LngLat;
      setInfoCoords(`${_coords.lat}, ${_coords.lng}`);
      const _addressData = await getFeaturesFromCoords(_coords);
      setInfoAddress(_addressData.features[0].place_name);
      setPanelMode('INFO_MODE');
    } else {
      setPanelMode('EDIT_MODE');
    }
  };

  const handleOnLoginClick = async () => {
    await signInWithGoogleHandler();
  };

  const handleOnSubmitClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    selectedFeatures.map(async (_selectedFeature) => {
      const newProperty: Property = {
        quadkey: _selectedFeature.properties!.quadkey,
        color: color.toString(),
        comment: commentRef.current!.value,
        uidUser: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        updatedAt: null,
      };

      await submitProperty(newProperty);
    });
    commentRef.current!.value = '';
    setSelectedFeatures([]);
    setIsSubmitting(false);
  };

  const handleOnColorChangeComplete = (
    _color: ColorResult,
    _event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setColor(_color.hex);
  };

  const handleOnColorButtonClick = () => {
    setIsColorOpen(!isColorOpen);
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex flex-col-reverse justify-between h-full m-3 md:flex-row'>
        <div className='z-30 md:w-[30%] flex flex-col md:h-full bg-white border rounded-lg drop-shadow-md p-2 mt-3 md:mt-0'>
          <div className='p-1'>
            <h1 className='text-xl font-semibold'>
              {panelMode == 'EDIT_MODE'
                ? 'Buy This Area'
                : 'Property Information'}
            </h1>
            <div className='h-[1px] bg-gray-200 my-2'></div>
          </div>
          <div className='flex flex-col h-full p-1'>
            {panelMode == 'EDIT_MODE' && (
              <div className='flex flex-col justify-between h-full'>
                <div className='flex flex-col h-full'>
                  <h4 className='mb-1 font-medium text-gray-600 text-md'>
                    Selected areas
                  </h4>
                  <div className='h-full max-h-[300px] rounded-lg bg-gray-50 border p-5 overflow-scroll scrollbar-thin scrollbar-thumb-gray-200 scrollbar-thumb-rounded-full'>
                    {selectedFeatures.map((_feature, index) => (
                      <div className='text-base text-gray-600' key={index}>
                        {_feature.properties!.quadkey}
                      </div>
                    ))}
                  </div>
                  <h4 className='mt-4 mb-1 font-medium text-gray-600 text-md'>
                    Selected Area Color
                  </h4>
                  <div className='relative w-fit'>
                    <Button
                      variant='fill'
                      className='w-20 px-1 border rounded-md bg-gray-50'
                      onClick={handleOnColorButtonClick}
                    >
                      <div
                        className='w-full h-5 bg-white border'
                        style={{ background: color.toString() }}
                      />
                    </Button>
                    {isColorOpen && (
                      <div
                        onMouseLeave={() => setIsColorOpen(false)}
                        className='absolute top-0 -right-[100%] w-full pl-2'
                      >
                        <SketchPicker
                          color={color}
                          onChange={handleOnColorChangeComplete}
                        />
                      </div>
                    )}
                  </div>

                  <div></div>
                  <h4 className='mt-4 mb-1 font-medium text-gray-600 text-md'>
                    Comment
                  </h4>
                  <div className='h-full p-3 overflow-hidden border rounded-lg min-h-[200px] bg-gray-50'>
                    <textarea
                      ref={commentRef}
                      className='flex w-full h-full p-2 overflow-scroll text-base text-gray-900 bg-gray-100 border-none rounded-lg outline-none scrollbar-thin scrollbar-thumb-gray-200 scrollbar-thumb-rounded-full scroll-my-2'
                      style={{ resize: 'none' }}
                    ></textarea>
                  </div>
                </div>
                <div className='my-3'>
                  {user ? (
                    <Button
                      variant='fill'
                      onClick={handleOnSubmitClick}
                      className='py-2 border rounded-lg'
                    >
                      {isSubmitting ? (
                        <OneEightyRing width={30} height={30} />
                      ) : (
                        'Submit'
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant='outline'
                      onClick={handleOnLoginClick}
                      className='text-white bg-gray-900 hover:bg-gray-800'
                    >
                      Login To Submit
                    </Button>
                  )}
                </div>
              </div>
            )}

            {panelMode == 'INFO_MODE' && infoProperty && (
              <div className='flex flex-col h-full'>
                <div className='flex w-full p-2 bg-white drop-shadow'>
                  <Image
                    width={50}
                    height={50}
                    src={infoProperty.photoURL}
                    alt={infoProperty.displayName}
                    className='rounded-full drop-shadow-md'
                  />
                  <h3 className='mt-2 ml-3 text-lg font-semibold text-gray-600'>
                    {infoProperty.displayName}
                  </h3>
                </div>
                <div className='flex flex-col w-full p-2 mt-4 bg-white drop-shadow'>
                  <div className='flex flex-col'>
                    <h3 className='mt-2 ml-3 text-base font-semibold text-gray-600'>
                      Address
                    </h3>
                    <h3 className='mt-2 ml-3 text-sm font-semibold text-gray-600 break-words line-clamp-1'>
                      {infoAddress}
                    </h3>
                  </div>
                  <div className='flex flex-col mt-1'>
                    <h3 className='mt-2 ml-3 text-base font-semibold text-gray-600'>
                      Quadkey
                    </h3>
                    <h3 className='mt-2 ml-3 text-sm font-semibold text-gray-600 break-words line-clamp-1'>
                      {infoProperty.quadkey}
                    </h3>
                  </div>
                  <div className='flex flex-col mt-1'>
                    <h3 className='mt-2 ml-3 text-base font-semibold text-gray-600'>
                      Coordinates
                    </h3>
                    <h3 className='mt-2 ml-3 text-sm font-semibold text-gray-600 break-words line-clamp-1'>
                      {infoCoords}
                    </h3>
                  </div>
                </div>
                <div className='flex flex-col w-full p-2 mt-4 bg-white drop-shadow'>
                  <div className='flex items-center justify-between'>
                    <h3 className='mt-2 ml-3 text-base font-semibold text-gray-600'>
                      Color
                    </h3>
                    <div
                      className='w-12 h-4 rounded-full drop-shadow-md'
                      style={{ background: infoProperty.color }}
                    ></div>
                  </div>
                  <div className='flex items-end justify-between h-full mt-1'>
                    <h3 className='mt-2 ml-3 text-base font-semibold text-gray-600'>
                      Register Date
                    </h3>
                    <h3 className='mt-2 ml-3 text-sm font-semibold text-gray-600 break-words line-clamp-1'>
                      {dayjs(infoProperty.createdAt).format('MMM DD, YYYY')}
                    </h3>
                  </div>
                </div>
                <div className='flex flex-col h-full mt-1 min-h-[200px]'>
                  <h3 className='mt-2 ml-1 text-base font-semibold text-gray-600'>
                    Comment :
                  </h3>
                  <h3 className='h-full p-2 mt-2 ml-1 overflow-scroll text-sm font-medium text-gray-600 break-words border rounded-lg grow scrollbar-thin scrollbar-thumb-gray-200 scrollbar-thumb-rounded-full'>
                    {infoProperty.comment}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='z-10 flex flex-col w-full h-[70vh] p-1 bg-white border rounded-lg md:h-full md:mx-3 overflow-clip drop-shadow-md'>
          <MainMap
            onSelectedFeaturesChanged={handleOnSelectedFeaturesChanged}
            onMapLoaded={handleOnMapLoaded}
            selectedFeatures={selectedFeatures}
            propertyFeatures={propertyFeatures}
            propertyQuadkeys={propertyQuadkeys}
          />
        </div>
      </div>
      <SnackbarProvider />
    </div>
  );
}
