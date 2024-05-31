'use client';

import { useEffect, useState } from 'react';
import useLoginModal from "@/app/hooks/useLoginModal";
import useAddParkingModal from "@/app/hooks/useAddParkingModal";
import { isAuthenticated, getUserId } from "@/app/lib/auth";

const AddParkingButton: React.FC = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const loginModal = useLoginModal();
    const addParkingModal = useAddParkingModal();

    useEffect(() => {
        const id = getUserId();
        setUserId(id);
    }, []);

    const handleButtonClick = () => {
        if (isAuthenticated()) {
            addParkingModal.open();
        } else {
            loginModal.open();
        }
    };

    return (
        <div 
            onClick={handleButtonClick}
            className="p-2 cursor-pointer text-sm font-semibold rounded-full hover:bg-gray-200"
        >
            Add Parking
        </div>
    );
};

export default AddParkingButton;
