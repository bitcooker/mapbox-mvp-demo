import { db } from './firebase';
import { addDoc, collection } from 'firebase/firestore';

export const addDocument = async <T>(collectionName: string, data: T) => {
    return await addDoc(collection(db, collectionName), data!);
}