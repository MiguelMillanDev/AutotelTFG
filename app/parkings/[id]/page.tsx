'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/app/firebaseConfig';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { checkIfRented, handleRent } from '../../../app/reservation-services';

interface ParkingDetailsProps {
    id: string;
    title: string;
    image_url: string;
    description: string;
    price_per_hour: number;
    spaces: number;
    country: string;
    user_id: string;
    is_rented: boolean;
    latitude: number;
    longitude: number;
}

interface User {
    id: string;
    name: string;
    email: string;
    profilePicUrl?: string;
}

const DefaultIcon = L.icon({
    iconUrl: (iconUrl as unknown) as string,
    shadowUrl: (iconShadowUrl as unknown) as string,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const fetchParkingDetails = async (id: string): Promise<ParkingDetailsProps | null> => {
    const docRef = doc(db, 'parkings', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as Omit<ParkingDetailsProps, 'id'>;
        return { id: docSnap.id, ...data };
    } else {
        throw new Error('No such document!');
    }
};

const fetchUserDetails = async (id: string): Promise<User | null> => {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data() as User;
        return { ...data, id: docSnap.id };
    } else {
        throw new Error('No such document!');
    }
};

const deleteParkingAndReservations = async (parkingId: string) => {
    const reservationsRef = collection(db, 'reservations');
    const q = query(reservationsRef, where('parking_id', '==', parkingId));
    const querySnapshot = await getDocs(q);

    // Elimina todas las reservas asociadas con el parking
    for (const reservationDoc of querySnapshot.docs) {
        await deleteDoc(reservationDoc.ref);
    }

    // Elimina el parking
    const parkingDocRef = doc(db, 'parkings', parkingId);
    await deleteDoc(parkingDocRef);
};

const ParkingDetailsPage = ({ params }: { params: { id: string } }) => {
    const [parking, setParking] = useState<ParkingDetailsProps | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user] = useAuthState(auth);
    const [owner, setOwner] = useState<User | null>(null);
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isRented, setIsRented] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const getParkingDetails = async () => {
            try {
                const data = await fetchParkingDetails(params.id);
                setParking(data);
                if (data) {
                    const ownerData = await fetchUserDetails(data.user_id);
                    setOwner(ownerData);
                }
            } catch (err) {
                const error = err as Error;
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        getParkingDetails();
    }, [params.id]);

    const handleCheckAvailability = async () => {
        if (parking && startDate && endDate && startTime && endTime) {
            const startDateTime = `${startDate}T${startTime}`;
            const endDateTime = `${endDate}T${endTime}`;
            const rented = await checkIfRented(parking.id, startDateTime, endDateTime);
            setIsRented(rented);
            if (!rented) {
                await handleRent(parking.id, user!.uid, startDateTime, endDateTime);
                router.push('/myparkings');
            } else {
                alert('This parking is already rented for the selected dates');
            }
        } else {
            alert('Please select start and end dates and times');
        }
    };

    const handleDeleteParking = async () => {
        if (parking) {
            try {
                await deleteParkingAndReservations(parking.id);
                alert('Parking and associated reservations deleted successfully');
                router.push('/myparkings');
            } catch (err) {
                const error = err as Error;
                setError(error.message);
            }
        }
    };

    const handleStartChat = async () => {
        if (owner && user) {
            console.log(`Starting chat with owner: ${owner.id}`);
            try {
                const conversationsRef = collection(db, 'conversations');
                const q = query(conversationsRef, where('userIds', 'array-contains', user.uid));
                const querySnapshot = await getDocs(q);
                let conversationId = '';

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.userIds.includes(owner.id)) {
                        conversationId = doc.id;
                    }
                });

                if (!conversationId) {
                    const newConversation = await addDoc(conversationsRef, {
                        userIds: [user.uid, owner.id],
                        users: [
                            {
                                id: user.uid,
                                name: user.displayName || '',
                            },
                            {
                                id: owner.id,
                                name: owner.name,
                            }
                        ],
                        messages: []
                    });
                    conversationId = newConversation.id;
                }

                router.push(`/inbox/${conversationId}`);
            } catch (error) {
                console.error('Error starting chat:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-semibold text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-semibold text-red-500">Error: {error}</div>
            </div>
        );
    }

    if (!parking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-semibold text-gray-600">No parking found</div>
            </div>
        );
    }

    const isOwner = user && user.uid === parking.user_id;

    return (
        <main className="max-w-5xl mx-auto p-6 space-y-8 bg-gray-50">
            <h1 className="text-4xl font-extrabold text-center text-gray-800">{parking.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="relative overflow-hidden rounded-lg shadow-lg">
                        <Image
                            src={parking.image_url}
                            width={800}
                            height={600}
                            alt="Parking Spot Image"
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <p className="mt-6 text-lg leading-relaxed text-gray-700">{parking.description}</p>
                    <div className="mt-6">
                        <MapContainer
                            center={[parking.latitude, parking.longitude]}
                            zoom={15}
                            className="h-96 w-full rounded-lg shadow-lg"
                        >
                            <TileLayer
                                url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=bIES5dNMeW4WnFcNkzAC`}
                                attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>'
                            />
                            <Marker position={[parking.latitude, parking.longitude]} icon={DefaultIcon}>
                                <Popup>
                                    {parking.title}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Details</h2>
                    <ul className="space-y-4 text-lg">
                        <li className="flex justify-between text-gray-700">
                            <span>Price per hour:</span> <span>${parking.price_per_hour}</span>
                        </li>
                        <li className="flex justify-between text-gray-700">
                            <span>Number of spaces:</span> <span>{parking.spaces}</span>
                        </li>
                        <li className="flex justify-between text-gray-700">
                            <span>Rented:</span> <span>{parking.is_rented ? 'Yes' : 'No'}</span>
                        </li>
                    </ul>
                    {owner && (
                        <div className="flex items-center space-x-4 mt-6">
                            {owner.profilePicUrl ? (
                                <img src={owner.profilePicUrl} alt="Owner Profile Picture" className="w-16 h-16 rounded-full" />
                            ) : (
                                <FaUserCircle className="w-16 h-16 text-gray-400" />
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{owner.name}</h3>
                                <p className="text-gray-600">{owner.email}</p>
                                <button
                                    onClick={handleStartChat}
                                    className="mt-2 text-blue-500 hover:underline"
                                >
                                    Contact Owner
                                </button>
                            </div>
                        </div>
                    )}
                    {!isOwner && (
                        <>
                            <div className="mt-6">
                                <label className="block text-gray-700">
                                    <span>Start Date</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </label>
                                <label className="block text-gray-700 mt-4">
                                    <span>Start Time</span>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </label>
                                <label className="block text-gray-700 mt-4">
                                    <span>End Date</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </label>
                                <label className="block text-gray-700 mt-4">
                                    <span>End Time</span>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </label>
                                <button
                                    onClick={handleCheckAvailability}
                                    className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Rent
                                </button>
                            </div>
                        </>
                    )}
                    {isOwner && (
                        <>
                            <div className="text-lg text-green-500 mt-6">This is your parking</div>
                            <button
                                onClick={handleDeleteParking}
                                className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </>
                    )}
                    {isRented && (
                        <div className="text-lg text-red-500 mt-4">This parking is already rented for the selected dates and times</div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ParkingDetailsPage;
