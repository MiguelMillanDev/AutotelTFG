import { db } from '@/app/firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

// Función para comprobar si el estacionamiento está alquilado en las fechas especificadas
export const checkIfRented = async (parkingId: string, startDate: string, endDate: string): Promise<boolean> => {
    const reservationsRef = collection(db, 'reservations');
    const q = query(
        reservationsRef,
        where('parking_id', '==', parkingId),
        where('start_date', '<=', endDate),
        where('end_date', '>=', startDate)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};

// Función para manejar la reserva
export const handleRent = async (parkingId: string, userId: string, startDate: string, endDate: string) => {
    const isRented = await checkIfRented(parkingId, startDate, endDate);
    if (!isRented) {
        await addDoc(collection(db, 'reservations'), {
            parking_id: parkingId,
            user_id: userId,
            start_date: startDate,
            end_date: endDate
        });
        console.log('Reserva creada con éxito');
    } else {
        console.error('Este estacionamiento ya está reservado para las fechas seleccionadas');
    }
};
