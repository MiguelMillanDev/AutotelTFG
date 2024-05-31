'use client';

import { useEffect, useState } from 'react';
import PropertyList from "../components/properties/ParkingList";
import { useRouter } from 'next/navigation';
import { auth, db } from '@/app/firebaseConfig';
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

type FavoriteType = {
    id: string;
    title: string;
    image_url: string;
    price_per_hour: number;
    is_favorite: boolean;
    check_in: string;
    check_out: string;
    is_rented: boolean;
    user_id: string;
};

const MyFavoritesPage = () => {
    const [user, loading, error] = useAuthState(auth);
    const [favorites, setFavorites] = useState<FavoriteType[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login'); // Redirige al usuario a la página de inicio de sesión si no está autenticado
        }
    }, [user, loading]);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData.favorites && userData.favorites.length > 0) {
                        const parkingsRef = collection(db, 'parkings');
                        const q = query(parkingsRef, where('id', 'in', userData.favorites));
                        const querySnapshot = await getDocs(q);
                        const favoriteParkings = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as FavoriteType[];
                        setFavorites(favoriteParkings);
                    }
                }
            }
        };

        fetchFavorites();
    }, [user]);

    if (loading) {
        return (
            <main className="max-w-[1500px] mx-auto px-6 py-12">
                <p>Loading...</p>
            </main>
        )
    }

    if (!user) {
        return (
            <main className="max-w-[1500px] mx-auto px-6 py-12">
                <p>You need to be authenticated...</p>
            </main>
        )
    }

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-12">
            <h1 className="my-6 text-2xl">My favorites</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {favorites.length > 0 ? (
                    <PropertyList 
                        parkings={favorites}
                    />
                ) : (
                    <p>No parkings found</p>
                )}
            </div>
        </main>
    )
}

export default MyFavoritesPage;
