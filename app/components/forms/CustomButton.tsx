// components/forms/CustomButton.tsx
import React from 'react';

interface CustomButtonProps {
    label: string;
    className?: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset"; // Aseguramos que type sea opcional y de estos tres tipos
}

const CustomButton: React.FC<CustomButtonProps> = ({
    label,
    className,
    onClick,
    type = "button"
}) => {
    return (
        <button 
            type={type}
            onClick={onClick}
            className={`w-full py-4 bg-blue-500 text-white text-center rounded-xl transition cursor-pointer ${className}`}
        >
            {label}
        </button>
    );
};

export default CustomButton;
