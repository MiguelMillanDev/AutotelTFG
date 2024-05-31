'use client';

import Modal from "./Modal";
import { useState } from "react";
import CustomButton from "../forms/CustomButton";
import useSearchModal from "@/app/hooks/useSearchModal";
import { SearchQuery } from "@/app/hooks/useSearchModal";

const SearchModal = () => {
    const searchModal = useSearchModal();
    const [title, setTitle] = useState<string>('');

    const closeAndSearch = () => {
        const newSearchQuery: SearchQuery = {
            title: title
        };

        searchModal.setQuery(newSearchQuery);
        searchModal.close();
    };

    return (
        <Modal
            label="Search"
            content={
                <>
                    <h2 className="mb-6 text-2xl">Search Parking by Title</h2>

                    <div className="space-y-4">
                        <label>Title:</label>
                        <input 
                            type="text" 
                            value={title} 
                            placeholder="Parking title..."
                            onChange={(e) => setTitle(e.target.value)} 
                            className="w-full h-14 px-4 border border-gray-300 rounded-xl"
                        />
                    </div>

                    <div className="mt-6 flex flex-row gap-4">
                        <CustomButton
                            label="Search"
                            onClick={closeAndSearch}
                        />
                    </div>
                </>
            }
            close={searchModal.close}
            isOpen={searchModal.isOpen}
        />
    );
};

export default SearchModal;
