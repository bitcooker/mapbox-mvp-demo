import { LngLat } from 'mapbox-gl'

export const getFeaturesFromCoords = async (_coords: LngLat) => {
    const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${_coords.lng},${_coords.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
    const response = await fetch(apiUrl);
    return await response.json();
}

export const getFeaturesFromAddress = async (address: string) => {
    const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
    const response = await fetch(apiUrl);
    return await response.json();
}