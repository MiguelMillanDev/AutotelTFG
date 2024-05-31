'use client';

import { db, auth } from '@/app/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const MyReservationsPage = () => {
    const [reservations, setReservations] = useState<any[]>([]);
    const [user, loading, error] = useAuthState(auth);

    useEffect(() => {
        const fetchReservations = async () => {
            if (!user) return;

            const reservationsRef = collection(db, 'reservations');
            const q = query(reservationsRef, where('user_id', '==', user.uid));
            const querySnapshot = await getDocs(q);

            const reservationsData = await Promise.all(querySnapshot.docs.map(async (reservationDoc) => {
                const reservation = reservationDoc.data();
                const parkingRef = doc(db, 'parkings', reservation.parking_id);
                const parkingSnap = await getDoc(parkingRef);
                return {
                    ...reservation,
                    parking: parkingSnap.exists() ? parkingSnap.data() : null,
                };
            }));

            setReservations(reservationsData);
        };

        fetchReservations();
    }, [user]);

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
                <div className="text-2xl text-red-500">Error: {error.message}</div>
            </div>
        );
    }

    if (reservations.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">No reservations found</div>
            </div>
        );
    }

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-3xl font-bold text-gray-800">My Reservations</h1>

            <div className="space-y-6">
                {reservations.map((reservation: any) => (
                    <div key={reservation.id} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-md border border-gray-300 rounded-xl bg-white">
                        <div className="col-span-1">
                            <div className="relative overflow-hidden aspect-square rounded-xl">
                                {reservation.parking && (
                                    <Image
                                        fill
                                        src={reservation.parking.image_url}
                                        className="hover:scale-110 object-cover transition h-full w-full"
                                        alt="Parking Spot Image"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-3">
                            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
                                {reservation.parking ? reservation.parking.title : 'Parking not found'}
                            </h2>
                            <p className="mb-2 text-lg text-gray-700">
                                <strong>Start Date:</strong> {reservation.start_date}
                            </p>
                            
                            <p className="mb-2 text-lg text-gray-700">
                                <strong>End Date:</strong> {reservation.end_date}
                            </p>
                            
                            {reservation.parking && (
                                <Link 
                                    href={`/parkings/${reservation.parking_id}`}
                                    className="mt-6 inline-block py-3 px-6 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Go to Parking
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}

export default MyReservationsPage;
