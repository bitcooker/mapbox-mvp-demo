import { LngLat } from 'mapbox-gl'

export default function parseCoords(text: string) {
    const textArrays = text.trim().split(',')
    if (textArrays.length == 2) {
        const lat = parseFloat(textArrays[0].trim());
        const lng = parseFloat(textArrays[0].trim());
        if (isNaN(lat) || isNaN(lng) || lat > 90 || lat < -90 || lng > 180 || lng < -180)
            return null
        return {
            lat: parseFloat(textArrays[0].trim()),
            lng: parseFloat(textArrays[1].trim()),
        } as LngLat;

    }
    return null;
}