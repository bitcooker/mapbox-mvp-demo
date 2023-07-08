import Property from '@/types/Property';
import { addDocument } from './firestore';

export const submitProperty = (property: Property) => {
    addDocument('properties', property);
}