"use client";

import React, {useRef} from 'react';

interface DropZoneProps {
    onFileSelected: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({onFileSelected}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            onFileSelected(event.dataTransfer.files[0]);
        }
    };

    return (
        <>
            <h1 className="text-xl md:text-2xl font-bold mb-4 text-black">Enviar Áudio para Transcrição</h1>

            <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 cursor-pointer text-blue-500 hover:bg-blue-100 transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M11 5L6 9H3a1 1 0 00-1 1v4a1 1 0 001 1h3l5 4V5z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
                </svg>
                <p className="text-lg font-bold">Arraste e solte o áudio aqui</p>
                <p className="text-sm text-gray-500 mt-2">ou clique para selecionar um arquivo</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".dat,.waptt,.m4a,audio/*"
                    onChange={(e) => e.target.files && onFileSelected(e.target.files[0])}
                    className="hidden"
                />
            </div>
        </>
    );
};

export default DropZone;
