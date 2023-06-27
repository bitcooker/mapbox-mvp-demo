import firebase, { db } from './firebase';
import { addDoc, collection, doc, getDoc, getFirestore, limit, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore';

export const addDocument = async <T>(collectionName: string, data: T) => {
    return await addDoc(collection(db, collectionName), data!);
}