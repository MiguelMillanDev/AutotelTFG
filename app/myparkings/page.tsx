'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { db, auth } from '@/app/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ParkingList from "../components/properties/ParkingList";

const MyPropertiesPage = () => {
    const [user] = useAuthState(auth);
    const [parkings, setParkings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParkings = async () => {
            if (!user) return;

            const parkingsRef = collection(db, 'parkings');
            const q = query(parkingsRef, where('user_id', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const userParkings = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setParkings(userParkings);
            setLoading(false);
        };

        fetchParkings();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl">My Parkings</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {parkings.length === 0 ? (
                    <div className="text-xl">No parkings found</div>
                ) : (
                    <ParkingList parkings={parkings} />
                )}
            </div>
        </main>
    );
};

export default MyPropertiesPage;
