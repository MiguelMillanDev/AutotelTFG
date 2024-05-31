// api/reservations/create.ts
import { db, auth } from '@/app/firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default async function handler(req, res) {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const { parkingId, startDate, endDate } = req.body;

            try {
                // Check if the parking is already reserved
                const reservationsRef = collection(db, 'reservations');
                const q = query(reservationsRef, where('parking_id', '==', parkingId));
                const querySnapshot = await getDocs(q);
                const reservations = querySnapshot.docs.map(doc => doc.data());

                for (const reservation of reservations) {
                    if (
                        (startDate >= reservation.start_date && startDate <= reservation.end_date) ||
                        (endDate >= reservation.start_date && endDate <= reservation.end_date) ||
                        (startDate <= reservation.start_date && endDate >= reservation.end_date)
                    ) {
                        return res.status(400).json({ message: 'Parking is already reserved for these dates.' });
                    }
                }

                // Create a new reservation
                await addDoc(collection(db, 'reservations'), {
                    parking_id: parkingId,
                    user_id: user.uid,
                    start_date: startDate,
                    end_date: endDate,
                });

                res.status(200).json({ message: 'Reservation created successfully.' });
            } catch (error) {
                console.error('Error creating reservation:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    });
}
