// api/reservations/user.ts
import { db, auth } from '@/app/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default async function handler(req, res) {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const reservationsRef = collection(db, 'reservations');
                const q = query(reservationsRef, where('user_id', '==', user.uid));
                const querySnapshot = await getDocs(q);

                const reservations = [];
                for (const doc of querySnapshot.docs) {
                    const data = doc.data();
                    const parkingDoc = await getDoc(doc(db, 'parkings', data.parking_id));
                    if (parkingDoc.exists()) {
                        reservations.push({
                            ...data,
                            property: parkingDoc.data()
                        });
                    }
                }

                res.status(200).json(reservations);
            } catch (error) {
                console.error('Error fetching reservations:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    });
}
