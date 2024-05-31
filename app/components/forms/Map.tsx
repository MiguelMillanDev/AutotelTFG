'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { collection, addDoc, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebaseConfig';

// Para manejar problemas con los íconos de Leaflet
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Ajuste de tipos para las imágenes importadas
const DefaultIcon = L.icon({
    iconUrl: (iconUrl as unknown) as string,
    shadowUrl: (iconShadowUrl as unknown) as string,
});

L.Marker.prototype.options.icon = DefaultIcon;

type LocationType = {
    id: string;
    lat: number;
    lng: number;
    created_by: {
        id: string;
        name: string;
    };
    created_at: string;
};

const MapEvents: React.FC<{ addLocation: (lat: number, lng: number) => void }> = ({ addLocation }) => {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            addLocation(lat, lng);
        },
    });
    return null;
};

const MapComponent: React.FC = () => {
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [user] = useAuthState(auth);

    useEffect(() => {
        const locationsRef = collection(db, 'locations');
        const unsubscribe = onSnapshot(locationsRef, (querySnapshot) => {
            const locs: LocationType[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as DocumentData;
                locs.push({ id: doc.id, ...data } as LocationType);
            });
            setLocations(locs);
        });

        return () => unsubscribe();
    }, []);

    const addLocation = async (lat: number, lng: number) => {
        if (!user) return;

        await addDoc(collection(db, 'locations'), {
            lat,
            lng,
            created_by: {
                id: user.uid,
                name: user.displayName || 'Anonymous',
            },
            created_at: new Date().toISOString(),
        });
    };

    return (
        <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: '100vh', width: '100%' }}
        >
            <MapEvents addLocation={addLocation} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.map(loc => (
                <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                    <Popup>
                        Added by: {loc.created_by.name}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;
