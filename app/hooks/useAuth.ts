
// useAuth.js
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebase';


type UserType = {
    uid: string;
    displayName: string;
    email: string;
}


export const useAuth = () => {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
};