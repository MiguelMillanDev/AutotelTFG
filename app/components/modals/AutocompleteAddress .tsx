import React, { useState } from 'react';
import Select from 'react-select';
import axios from 'axios';

type AutocompleteAddressProps = {
    setLocation: (lat: number, lng: number) => void;
};

type OptionType = {
    value: [number, number];
    label: string;
};

const AutocompleteAddress: React.FC<AutocompleteAddressProps> = ({ setLocation }) => {
    const [options, setOptions] = useState<OptionType[]>([]);
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (value: string) => {
        setInputValue(value);
        if (value.length > 2) {
            axios.get(`https://api.maptiler.com/geocoding/${value}.json?key=bIES5dNMeW4WnFcNkzAC`)
                .then(response => {
                    const newOptions = response.data.features.map((feature: any) => ({
                        value: feature.geometry.coordinates,
                        label: feature.place_name,
                    }));
                    setOptions(newOptions);
                })
                .catch(error => {
                    console.error('Error fetching geocoding data:', error);
                });
        }
    };

    const handleChange = (selectedOption: OptionType | null) => {
        if (selectedOption) {
            setLocation(selectedOption.value[1], selectedOption.value[0]); // Lat, Lng
        }
    };

    return (
        <div style={{ position: 'relative', zIndex: 1000 }}>
            <Select
                value={options.find(option => option.label === inputValue)}
                onChange={handleChange}
                onInputChange={handleInputChange}
                options={options}
                placeholder="Search for a location..."
                styles={{
                    menu: provided => ({ ...provided, zIndex: 9999 }),
                }}
            />
        </div>
    );
};

export default AutocompleteAddress;
