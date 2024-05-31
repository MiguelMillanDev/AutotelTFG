import React, { useState } from 'react';
import axios from 'axios';

interface SearchBarProps {
    setLocation: (lat: number, lng: number) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ setLocation }) => {
    const [query, setQuery] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: query,
                    format: 'json',
                    addressdetails: 1,
                    limit: 1,
                },
            });
            if (response.data.length > 0) {
                const { lat, lon } = response.data[0];
                setLocation(parseFloat(lat), parseFloat(lon));
            } else {
                alert('Ubicación no encontrada.');
            }
        } catch (error) {
            console.error('Error al buscar la dirección:', error);
            alert('Error al buscar la dirección.');
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex mb-4">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded-l-md"
                placeholder="Escribe una dirección"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-r-md">
                Buscar
            </button>
        </form>
    );
};

export default SearchBar;
