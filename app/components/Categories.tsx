'use client';

import { useState } from 'react';
import { FaCarSide, FaCaravan, FaWarehouse, FaRoad, FaAllergies } from 'react-icons/fa';
import useSearchModal, { SearchQuery } from '../hooks/useSearchModal';

const Categories = () => {
    const searchModal = useSearchModal();
    const [category, setCategory] = useState('');

    const _setCategory = (_category: string) => {
        setCategory(_category);

        const query: SearchQuery = {
            country: searchModal.query.country,
            checkIn: searchModal.query.checkIn,
            checkOut: searchModal.query.checkOut,
            numSpaces: searchModal.query.numSpaces,
            vehicleType: searchModal.query.vehicleType,
            features: searchModal.query.features,
            category: _category
        }

        searchModal.setQuery(query);
    }

    return (
        <div className="pt-3 cursor-pointer pb-6 flex items-center space-x-12">
            <div
                onClick={() => _setCategory('')}
                className={`pb-4 flex flex-col items-center space-y-2 border-b-2 ${category === '' ? 'border-black' : 'border-white'} opacity-60 hover:border-gray-200 hover:opacity-100`}>
                <FaAllergies size={20} />
                <span className='text-xs'>All</span>
            </div>

            <div
                onClick={() => _setCategory('covered')}
                className={`pb-4 flex flex-col items-center space-y-2 border-b-2 ${category === 'covered' ? 'border-black' : 'border-white'} opacity-60 hover:border-gray-200 hover:opacity-100`}>
                <FaCarSide size={20} />
                <span className='text-xs'>Covered</span>
            </div>

            <div
                onClick={() => _setCategory('uncovered')}
                className={`pb-4 flex flex-col items-center space-y-2 border-b-2 ${category === 'uncovered' ? 'border-black' : 'border-white'} opacity-60 hover:border-gray-200 hover:opacity-100`}>
                <FaCaravan size={20} />
                <span className='text-xs'>Uncovered</span>
            </div>

            <div
                onClick={() => _setCategory('indoor')}
                className={`pb-4 flex flex-col items-center space-y-2 border-b-2 ${category === 'indoor' ? 'border-black' : 'border-white'} opacity-60 hover:border-gray-200 hover:opacity-100`}>
                <FaWarehouse size={20} />
                <span className='text-xs'>Indoor</span>
            </div>

            <div
                onClick={() => _setCategory('street')}
                className={`pb-4 flex flex-col items-center space-y-2 border-b-2 ${category === 'street' ? 'border-black' : 'border-white'} opacity-60 hover:border-gray-200 hover:opacity-100`}>
                <FaRoad size={20} />
                <span className='text-xs'>Street</span>
            </div>
        </div>
    );
}

export default Categories;
