import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase';
import toast from 'react-hot-toast';

export const currentUser = () => {
    return onAuthStateChanged(auth, (user) => {

    })
}

export const signInWithGoogleHandler = async () => {
    const googleProvider = new GoogleAuthProvider();

    try {
        await signInWithPopup(auth, googleProvider);
        toast.success('Successfully logged in!');
    } catch (err) {
        toast.error('Authentication Failed!');
    }
};

export async function signOutHandler() {
    try {
        await signOut(auth);
        toast('You logged out.');
    } catch (error) {
        console.error('Error signing out', error);
    }
}