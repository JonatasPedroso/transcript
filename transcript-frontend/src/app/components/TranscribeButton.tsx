import React from 'react';

interface TranscribeButtonProps {
    onClick: () => void;
    disabled: boolean;
}

const TranscribeButton: React.FC<TranscribeButtonProps> = ({ onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center py-2 px-4 rounded-lg mt-4 ${disabled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v18l15-9L5 3z" />
        </svg>
        Transcrever
    </button>
);

export default TranscribeButton;
