import React from 'react';

interface TranscribeButtonProps {
    onClick: () => void;
    disabled: boolean;
    isLoading: boolean;
}

const TranscribeButton: React.FC<TranscribeButtonProps> = ({ onClick, disabled, isLoading }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center py-2 px-4 rounded-lg mt-4 ${disabled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
    >
        {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v18l15-9L5 3z" />
            </svg>
        )}
        {isLoading ? 'Transcrevendo...' : 'Transcrever'}
    </button>
);

export default TranscribeButton;