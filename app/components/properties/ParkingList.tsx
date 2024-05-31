'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ParkingListItem from "./ParkingListItem";
import { db, auth } from '@/app/firebaseConfig';
import { collection, query, where, getDocs, Query, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import useSearchModal from '@/app/hooks/useSearchModal';

export type ParkingType = {
  id: string;
  title: string;
  image_url: string;
  price_per_hour: number;
  is_favorite: boolean;
  check_in: string;
  check_out: string;
  is_rented: boolean;
};

interface ParkingListProps {
  owner_id?: string | null;
  favorites?: boolean | null;
  parkings?: ParkingType[];
}

const ParkingList: React.FC<ParkingListProps> = ({
  owner_id,
  favorites,
  parkings: initialParkings
}) => {
  const params = useSearchParams();
  const searchModal = useSearchModal();
  const country = searchModal.query?.country || params.get('country');
  const numSpaces = searchModal.query?.numSpaces || parseInt(params.get('numSpaces') || '0', 10);
  const checkinDate = searchModal.query?.checkIn || params.get('checkIn');
  const checkoutDate = searchModal.query?.checkOut || params.get('checkOut');
  const category = searchModal.query?.category || params.get('category');
  const [parkings, setParkings] = useState<ParkingType[]>(initialParkings || []);
  const [loading, setLoading] = useState(true);
  const [user, authLoading, authError] = useAuthState(auth);

  const markFavorite = async (id: string, is_favorite: boolean) => {
    console.log(`FavoriteButton markFavorite called with id: ${id} and is_favorite: ${is_favorite}`);
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);

    try {
      if (is_favorite) {
        await updateDoc(userDocRef, {
          favorites: arrayUnion(id)
        });
      } else {
        await updateDoc(userDocRef, {
          favorites: arrayRemove(id)
        });
      }
      const tmpParkings = parkings.map((parking: ParkingType) => {
        if (parking.id === id) {
          parking.is_favorite = is_favorite;
        }
        return parking;
      });
      setParkings(tmpParkings);
    } catch (error) {
      console.error('Error updating favorites: ', error);
    }
  };

  const getParkings = async () => {
    setLoading(true);
    if (!user) return;

    let q: Query = collection(db, 'parkings');

    if (owner_id) {
      q = query(q, where('owner_id', '==', owner_id));
    } else if (favorites) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.favorites && userData.favorites.length > 0) {
          q = query(q, where('id', 'in', userData.favorites));
        } else {
          setParkings([]);
          setLoading(false);
          return;
        }
      }
    } else {
      const filters: any[] = [];
      if (country) {
        filters.push(where('country', '==', country));
      }
      if (numSpaces) {
        filters.push(where('spaces', '>=', numSpaces));
      }
      if (category) {
        filters.push(where('category', '==', category));
      }
      if (checkinDate) {
        filters.push(where('check_in', '>=', checkinDate));
      }
      if (checkoutDate) {
        filters.push(where('check_out', '<=', checkoutDate));
      }

      if (filters.length > 0) {
        q = query(q, ...filters);
      }
    }

    try {
      const querySnapshot = await getDocs(q);
      const parkingData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParkingType[];

      setParkings(parkingData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch parkings', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      getParkings();
    }
  }, [user, authLoading, category, searchModal.query, params]);

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {parkings.length > 0 ? (
        parkings.map((parking) => (
          <ParkingListItem 
            key={parking.id}
            parking={parking}
            markFavorite={markFavorite}
          />
        ))
      ) : (
        <div>No parkings found</div>
      )}
    </>
  );
};

export default ParkingList;
