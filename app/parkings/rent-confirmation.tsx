'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/app/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const RentConfirmationPage = () => {
    const [parking, setParking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user] = useAuthState(auth);
    const router = useRouter();

    useEffect(() => {
        const storedParking = sessionStorage.getItem('parkingToRent');
        if (storedParking) {
            setParking(JSON.parse(storedParking));
            setLoading(false);
        } else {
            setError('No parking details found.');
            setLoading(false);
        }
    }, []);

    const handleConfirmRent = async () => {
        if (!parking) return;

        try {
            const docRef = doc(db, 'parkings', parking.id);
            await updateDoc(docRef, { is_rented: true });
            sessionStorage.removeItem('parkingToRent');
           
        } catch (error) {
            console.error('Failed to rent parking:', error);
            setError('Failed to rent parking.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl text-red-500">Error: {error}</div>
            </div>
        );
    }

    if (!parking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">No parking found</div>
            </div>
        );
    }

    return (
        <main className="max-w-[1200px] mx-auto px-6 pb-6">
            <h1 className="text-4xl font-bold mb-6">Confirm Rent</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <img
                        src={parking.image_url}
                        width={800}
                        height={600}
                        alt="Parking Spot Image"
                        className="rounded-lg shadow-lg"
                    />
                    <p className="mt-6 text-lg leading-relaxed">{parking.description}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
                    <h2 className="text-2xl font-bold">Details</h2>
                    <ul className="space-y-4 text-lg">
                        <li className="flex justify-between">
                            <span>Price per hour:</span> <span>${parking.price_per_hour}</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Number of spaces:</span> <span>{parking.spaces}</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Location:</span> <span>{parking.country}</span>
                        </li>
                    </ul>
                    <button
                        onClick={handleConfirmRent}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Confirm Rent
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors mt-4"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </main>
    );
};

export default RentConfirmationPage;
