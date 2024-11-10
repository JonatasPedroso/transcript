import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';

interface AudioPreviewProps {
    fileName: string;
    fileUrl: string;
    onRemove: () => void;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({ fileName, fileUrl, onRemove }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleRemoveClick = () => {
        setIsModalOpen(true);
    };

    const confirmRemoveAudio = () => {
        onRemove();
        setIsModalOpen(false);
    };

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-black">Arquivo Selecionado</h3>
            <div className="flex items-center justify-between mt-2 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{fileName}</p>
                <button onClick={handleRemoveClick} className="text-red-500 hover:text-red-700">Excluir</button>
            </div>
            <audio className="w-full mt-2" controls src={fileUrl}></audio>
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="fixed inset-0 bg-black opacity-30" />
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-auto z-20">
                        <Dialog.Title className="text-lg font-semibold text-black">Deseja mesmo remover o áudio?</Dialog.Title>
                        <Dialog.Description className="mt-2 text-sm text-gray-500">
                            Deseja mesmo excluir esse áudio que já está selecionado para transcrição?
                        </Dialog.Description>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button onClick={confirmRemoveAudio} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">Sim</button>
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Não</button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default AudioPreview;