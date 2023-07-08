'use client';
import React, { useState, useRef } from 'react';
import { useDetectClickOutside } from 'react-detect-click-outside';
import tileMath from 'quadkey-tilemath';
import { debounce } from 'lodash';
import { LngLat, LngLatLike } from 'mapbox-gl';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getFeaturesFromAddress, getFeaturesFromCoords } from '@/libs/mapbox';
import parseCoords from '@/utils/parse_coords';
import Button from '@/components/common/button/Button';
import { SearchResult } from './SearchBox.types';

interface IProps {
  flyTo(center: LngLatLike): void;
}

const SearchBox: React.FC<IProps> = ({ flyTo }) => {
  const [searchOption, setSearchOption] = useState('Quadkey');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOptionMenuOpen, setIsOptionMenuOpen] = useState(false);

  const optionMenuRef = useDetectClickOutside({
    onTriggered: () => {
      setIsOptionMenuOpen(false);
    },
  });

  const searchResultsMenuRef = useDetectClickOutside({
    onTriggered: () => {
      clearSearchBox();
    },
  });

  const clearSearchBox = () => {
    setSearchText('');
    setSearchResults([]);
  };

  const debouncedSearch = useRef(
    debounce(async (_searchText: string, _searchOption: string) => {
      switch (_searchOption) {
        case 'Quadkey':
          try {
            const coords = tileMath.quadkeyToPoint(_searchText) as LngLat;
            const data = await getFeaturesFromCoords(coords);
            if (data.features.length > 0)
              setSearchResults([{ text: data.features[0].place_name, coords }]);
          } catch (e) {
            setError('Invalid Quadkey');
          }
          break;
        case 'Lat/Lng':
          try {
            const coords = parseCoords(_searchText);
            if (coords) {
              const data = await getFeaturesFromCoords(coords);
              if (data.features.length > 0)
                setSearchResults([
                  { text: data.features[0].place_name, coords },
                ]);
            } else {
              setError('Invalid Coordinates');
              setSearchResults([]);
            }
          } catch (e) {
            setError('Invalid Coordinates');
            setSearchResults([]);
          }
          break;
        case 'Address':
          try {
            const data = await getFeaturesFromAddress(_searchText);
            if (data.features.length > 0) {
              const _searchResults = data.features.map((_feature: any) => {
                const _text = _feature.place_name;
                const _coords = {
                  lat: _feature.geometry.coordinates[1],
                  lng: _feature.geometry.coordinates[0],
                } as LngLat;

                return {
                  text: _text,
                  coords: _coords,
                } as SearchResult;
              });
              setSearchResults(_searchResults);
            } else setSearchResults([]);
          } catch {
            setError('Invalid Address');
            setSearchResults([]);
          }
          break;
      }
    }, 1000)
  ).current;

  const search = () => {
    if (searchResults.length > 0) {
      fly(searchResults[0].coords);
    }
  };

  const fly = (_coords: LngLat) => {
    setSearchResults([]);
    setSearchText('');
    flyTo(_coords);
  };

  const handleOnSearchTextChanged = (e: React.FormEvent<HTMLInputElement>) => {
    const text = e.currentTarget.value;
    setError(null);
    setSearchText(text);
    if (text != '') debouncedSearch(text, searchOption);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key == 'Enter') {
      search();
    }
  };

  const handleOnSearchOptionSelected = (_option: string) => {
    clearSearchBox();
    setSearchOption(_option);
    setIsOptionMenuOpen(false);
  };

  return (
    <div className='absolute top-0 left-[50%] translate-x-[-50%] w-[90%] md:w-fit px-4 py-1 bg-white border drop-shadow-sm rounded-full mt-2'>
      <div className='flex items-center justify-between'>
        <Button variant='basic' className='w-8 h-8' onClick={search}>
          <MagnifyingGlassIcon className='stroke-gray-500' />
        </Button>
        <input
          type='text'
          value={searchText}
          onChange={handleOnSearchTextChanged}
          onKeyDown={handleOnKeyDown}
          className={`${
            error != null && 'text-red-500'
          } ml-2 text-gray-600 text-base rounded-lg outline-none block p-2.5 max-w-[300px] w-full`}
          placeholder='Search'
          required
        />
        <span className='bg-gray-300 w-[1px] h-6 mx-2'></span>
        <Button
          variant='fill'
          className={`w-32 ${isOptionMenuOpen && 'bg-gray-200'}`}
          onClick={() => setIsOptionMenuOpen(!isOptionMenuOpen)}
        >
          {searchOption}
        </Button>
      </div>
      {isOptionMenuOpen && (
        <div className='absolute bottom-0 right-0 pt-2 pr-4 translate-y-[100%]'>
          <div
            ref={optionMenuRef}
            className='p-1 bg-white rounded-md drop-shadow-sm'
          >
            <Button
              variant='fill'
              className='rounded-none'
              onClick={() => {
                handleOnSearchOptionSelected('Quadkey');
              }}
            >
              Quadkey
            </Button>
            <Button
              variant='fill'
              className='rounded-none'
              onClick={() => {
                handleOnSearchOptionSelected('Lat/Lng');
              }}
            >
              Lat/Lng
            </Button>
            <Button
              variant='fill'
              className='rounded-none'
              onClick={() => {
                handleOnSearchOptionSelected('Address');
              }}
            >
              Address
            </Button>
          </div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div
          ref={searchResultsMenuRef}
          className='absolute bottom-0 left-0 pt-2 px-8 translate-y-[100%]  w-full'
        >
          <div
            ref={optionMenuRef}
            className='p-1 bg-white rounded-md drop-shadow-sm'
          >
            {searchResults.map((_searchResult, index) => (
              <Button
                variant='basic'
                key={index}
                onClick={() => fly(_searchResult.coords)}
              >
                <div className='w-full px-1 py-1 text-sm text-gray-500 line-clamp-1'>
                  {_searchResult.text}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
