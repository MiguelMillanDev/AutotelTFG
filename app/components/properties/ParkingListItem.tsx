'use client';

import Image from "next/image";
import { ParkingType } from "./ParkingList";
import { useRouter } from "next/navigation";
import FavoriteButton from "../FavoriteButton";

interface ParkingProps {
  parking: ParkingType;
  markFavorite: (id: string, is_favorite: boolean) => void;
}

const ParkingListItem: React.FC<ParkingProps> = ({ parking, markFavorite }) => {
  const router = useRouter();

  return (
    <div 
      className="cursor-pointer"
      onClick={() => router.push(`/parkings/${parking.id}`)}
    >
      <div className="relative overflow-hidden aspect-square rounded-xl">
        <Image
          fill
          src={parking.image_url}
          sizes="(max-width: 768px) 768px, (max-width: 1200px): 768px, 768px"
          className="hover:scale-110 object-cover transition h-full w-full"
          alt="Parking space"
        />

        <FavoriteButton
          id={parking.id}
          is_favorite={parking.is_favorite}
          markFavorite={markFavorite}
        />
      </div>

      <div className="mt-2">
        <p className="text-lg font-bold">{parking.title}</p>
        <p className="text-sm text-gray-500">{`Check-in: ${parking.check_in}`}</p>
        <p className="text-sm text-gray-500">{`Check-out: ${parking.check_out}`}</p>
        <p className="text-sm text-gray-500">{parking.is_rented ? 'Rented' : 'Available'}</p>
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-500"><strong>${parking.price_per_hour}</strong> per hour</p>
      </div>
    </div>
  );
};

export default ParkingListItem;
