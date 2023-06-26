import firebase from './firebase';
import { addDoc, collection, doc, getDoc, getFirestore, limit, orderBy, query, startAfter, updateDoc, where } from 'firebase/firestore';

const firestore = getFirestore(firebase);
