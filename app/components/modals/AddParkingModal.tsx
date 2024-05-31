'use client';

import { ChangeEvent, useState } from 'react';
import Modal from './Modal';
import CustomButton from '../forms/CustomButton';
import Categories from '../addproperty/Categories';
import useAddParkingModal from '@/app/hooks/useAddParkingModal';
import { db, storage } from '@/app/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getUserId } from '@/app/lib/auth';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import AutocompleteAddress from './AutocompleteAddress '; // Import the autocomplete component

// Adjust types for the imported images
const DefaultIcon = L.icon({
    iconUrl: (iconUrl as unknown) as string,
    shadowUrl: (iconShadowUrl as unknown) as string,
});

L.Marker.prototype.options.icon = DefaultIcon;

type LocationType = {
    lat: number;
    lng: number;
};

const AddParkingModal = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<string[]>([]);
    const [dataCategory, setDataCategory] = useState<string>('');
    const [dataTitle, setDataTitle] = useState<string>('');
    const [dataDescription, setDataDescription] = useState<string>('');
    const [dataPrice, setDataPrice] = useState<string>('');
    const [dataSpaces, setDataSpaces] = useState<string>('');
    const [dataImage, setDataImage] = useState<File | null>(null);
    const [checkIn, setCheckIn] = useState<string>('');
    const [checkOut, setCheckOut] = useState<string>('');
    const [location, setLocation] = useState<LocationType | null>(null);

    const addParkingModal = useAddParkingModal();
    const router = useRouter();

    const setCategory = (category: string) => {
        setDataCategory(category);
    };

    const setImage = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const tmpImage = event.target.files[0];
            setDataImage(tmpImage);
        }
    };

    const uploadImage = async (image: File) => {
        const imageRef = ref(storage, `parkings/${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        const url = await getDownloadURL(snapshot.ref);
        return url;
    };

    const submitForm = async () => {
        if (
            dataCategory &&
            dataTitle &&
            dataDescription &&
            dataPrice &&
            dataSpaces &&
            dataImage &&
            checkIn &&
            checkOut &&
            location
        ) {
            try {
                const imageUrl = await uploadImage(dataImage);
                const docRef = await addDoc(collection(db, 'parkings'), {
                    category: dataCategory,
                    title: dataTitle,
                    description: dataDescription,
                    price_per_hour: dataPrice,
                    spaces: dataSpaces,
                    image_url: imageUrl,
                    user_id: getUserId(),
                    check_in: checkIn,
                    check_out: checkOut,
                    latitude: location.lat,  // Save the latitude
                    longitude: location.lng, // Save the longitude
                    is_rented: false // Ensure is_rented is set to false by default
                });

                console.log("Document written with ID: ", docRef.id);
                addParkingModal.close();  // Close the modal after success
                window.location.reload();  // Reload the page
            } catch (error) {
                if (error instanceof Error) {
                    console.error("Error adding document: ", error.message);
                    setErrors([`Error adding parking: ${error.message}`]);
                } else {
                    console.error("Error adding document: ", error);
                    setErrors([`Error adding parking.`]);
                }
            }
        } else {
            setErrors(['Please complete all fields.']);
        }
    };

    // Wrap the setLocation function to match the signature
    const handleSetLocation = (lat: number, lng: number) => {
        setLocation({ lat, lng });
    };

    const content = (
        <>
            {currentStep === 1 ? (
                <>
                    <h2 className='mb-6 text-2xl'>Choose Category</h2>
                    <Categories dataCategory={dataCategory} setCategory={setCategory} />
                    <CustomButton label='Next' onClick={() => setCurrentStep(2)} />
                </>
            ) : currentStep === 2 ? (
                <>
                    <h2 className='mb-6 text-2xl'>Describe your parking</h2>
                    <div className='pt-3 pb-6 space-y-4'>
                        <div className='flex flex-col space-y-2'>
                            <label>Title</label>
                            <input
                                type="text"
                                value={dataTitle}
                                onChange={(e) => setDataTitle(e.target.value)}
                                className='w-full p-4 border border-gray-600 rounded-xl'
                            />
                        </div>
                        <div className='flex flex-col space-y-2'>
                            <label>Description</label>
                            <textarea
                                value={dataDescription}
                                onChange={(e) => setDataDescription(e.target.value)}
                                className='w-full h-[200px] p-4 border border-gray-600 rounded-xl'
                            ></textarea>
                        </div>
                    </div>
                    <CustomButton label='Previous' className='mb-2 bg-black hover:bg-gray-800' onClick={() => setCurrentStep(1)} />
                    <CustomButton label='Next' onClick={() => setCurrentStep(3)} />
                </>
            ) : currentStep === 3 ? (
                <>
                    <h2 className='mb-6 text-2xl'>Details</h2>
                    <div className='pt-3 pb-6 space-y-4'>
                        <div className='flex flex-col space-y-2'>
                            <label>Price per hour</label>
                            <input
                                type="number"
                                value={dataPrice}
                                onChange={(e) => setDataPrice(e.target.value)}
                                className='w-full p-4 border border-gray-600 rounded-xl'
                            />
                        </div>
                        <div className='flex flex-col space-y-2'>
                            <label>Number of spaces</label>
                            <input
                                type="number"
                                value={dataSpaces}
                                onChange={(e) => setDataSpaces(e.target.value)}
                                className='w-full p-4 border border-gray-600 rounded-xl'
                            />
                        </div>
                        <div className='flex flex-col space-y-2'>
                            <label>Check-in Date</label>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                className='w-full p-4 border border-gray-600 rounded-xl'
                            />
                        </div>
                        <div className='flex flex-col space-y-2'>
                            <label>Check-out Date</label>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className='w-full p-4 border border-gray-600 rounded-xl'
                            />
                        </div>
                    </div>
                    <CustomButton label='Previous' className='mb-2 bg-black hover:bg-gray-800' onClick={() => setCurrentStep(2)} />
                    <CustomButton label='Next' onClick={() => setCurrentStep(4)} />
                </>
            ) : currentStep === 4 ? (
                <>
                    <h2 className='mb-6 text-2xl'>Location</h2>
                    <div className='pt-3 pb-6 space-y-4'>
                        <AutocompleteAddress setLocation={handleSetLocation} /> {/* Add the autocomplete component */}
                        <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                            <MapContainer
                                center={[location?.lat || 51.505, location?.lng || -0.09]}
                                zoom={13}
                                style={{ height: '100%', width: '100%', zIndex: 1 }}
                                key={location ? `${location.lat}-${location.lng}` : 'default-map'} // Add a key to force rerender when location changes
                            >
                                <TileLayer
                                    url="https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=bIES5dNMeW4WnFcNkzAC"
                                    attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>'
                                />
                                {location && (
                                    <Marker position={[location.lat, location.lng]}>
                                        <Popup>
                                            Selected Location
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        </div>
                    </div>
                    <CustomButton label='Previous' className='mb-2 bg-black hover:bg-gray-800' onClick={() => setCurrentStep(3)} />
                    <CustomButton label='Next' onClick={() => setCurrentStep(5)} />
                </>
            ) : (
                <>
                    <h2 className='mb-6 text-2xl'>Image</h2>
                    <div className='pt-3 pb-6 space-y-4'>
                        <div className='py-4 px-6 bg-gray-600 text-white rounded-xl'>
                            <input
                                type="file"
                                accept='image/*'
                                onChange={setImage}
                            />
                        </div>
                        {dataImage && (
                            <div className='w-[200px] h-[150px] relative'>
                                <Image
                                    fill
                                    alt="Parking image"
                                    src={URL.createObjectURL(dataImage)}
                                    className='w-full h-full object-cover rounded-xl'
                                />
                            </div>
                        )}
                    </div>
                    {errors.length > 0 && (
                        <div className='p-5 mb-4 bg-airbnb text-white rounded-xl opacity-80'>
                            {errors.map((error, index) => (
                                <div key={index}>{error}</div>
                            ))}
                        </div>
                    )}
                    <CustomButton label='Previous' className='mb-2 bg-black hover:bg-gray-800' onClick={() => setCurrentStep(4)} />
                    <CustomButton label='Submit' onClick={submitForm} />
                </>
            )}
        </>
    );

    return (
        <Modal isOpen={addParkingModal.isOpen} close={addParkingModal.close} label="Add Parking" content={content} />
    );
}

export default AddParkingModal;
