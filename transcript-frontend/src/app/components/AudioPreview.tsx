import React from 'react';

interface AudioPreviewProps {
    fileName: string;
    fileUrl: string;
    onRemove: () => void;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({ fileName, fileUrl, onRemove }) => (
    <div className="mt-6">
        <h3 className="text-lg font-semibold text-black">Arquivo Selecionado</h3>
        <div className="flex items-center justify-between mt-2 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium text-gray-700">{fileName}</p>
            <button onClick={onRemove} className="text-red-500 hover:text-red-700">Excluir</button>
        </div>
        <audio className="w-full mt-2" controls src={fileUrl}></audio>
    </div>
);

export default AudioPreview;
