import React, { useState, useEffect, useRef } from 'react';

interface TranscribedTextProps {
    text: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TranscribedText: React.FC<TranscribedTextProps> = ({ text, onChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleModalOpen = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => {
                setCopySuccess(false);
            }, 2000);
        });
    };

    useEffect(() => {
        if (isModalOpen && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isModalOpen]);

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-semibold mb-2 text-black">Texto Transcrito</h2>
                <button
                    onClick={handleModalOpen}
                    className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg mb-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10V4h6M20 14v6h-6M14 4h6v6M10 20H4v-6" />
                    </svg>
                </button>
            </div>
            <textarea
                value={text}
                onChange={onChange}
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg text-black"
            />
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-3/4">
                        <h2 className="text-lg md:text-xl font-semibold mb-4 text-black">Edite o texto transcrito</h2>
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={handleModalChange}
                            rows={20}
                            className="w-full p-3 border border-gray-300 rounded-lg text-black"
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleCopy}
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg mr-2 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2v-2M8 2v4a2 2 0 002 2h4a2 2 0 002-2V2M8 2h8M16 12h2M16 16h2M16 20h2" />
                                </svg>
                                Copiar
                            </button>
                            <button
                                onClick={handleModalClose}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Fechar
                            </button>
                        </div>
                        {copySuccess && (
                            <div className="mt-2 text-green-600">
                                Texto copiado com sucesso!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranscribedText;