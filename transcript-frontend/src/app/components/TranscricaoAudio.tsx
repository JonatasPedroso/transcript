"use client";

import React, { useState, useEffect } from 'react';
import Notification from './Notification';
import DropZone from './DropZone';
import AudioPreview from './AudioPreview';
import TranscribeButton from './TranscribeButton';
import TranscribedText from './TranscribedText';

const TranscricaoAudio: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string>('');
    const [transcribedText, setTranscribedText] = useState<string>('');
    const [notificationVisible, setNotificationVisible] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (notificationVisible) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer + 1);
            }, 1000);
        } else if (!notificationVisible && timer !== 0) {
            clearInterval(interval!);
        }
        return () => clearInterval(interval!);
    }, [notificationVisible, timer]);

    const handleFileSelected = (selectedFile: File) => {
        setFile(selectedFile);
        setFileUrl(URL.createObjectURL(selectedFile));
        setTranscribedText('');
    };

    const handleRemoveAudio = () => {
        setFile(null);
        setFileUrl('');
        setTranscribedText('');
    };

    const handleTranscribe = async () => {
        if (!file) return;

        setNotificationVisible(true);
        setTimer(0);

        const formData = new FormData();
        formData.append('audio', file);

        try {
            const response = await fetch('http://localhost:5000/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setTranscribedText(result.text);
            } else {
                alert("Erro ao transcrever o áudio.");
            }
        } catch (error) {
            console.error("Erro na comunicação com o servidor:", error);
            alert("Erro na comunicação com o servidor.");
        } finally {
            setNotificationVisible(false);
        }
    };

    return (
        <div>
            <Notification visible={notificationVisible} text="Transcrição em progresso" timer={timer} />
            <DropZone onFileSelected={handleFileSelected} />
            {file && (
                <AudioPreview fileName={file.name} fileUrl={fileUrl} onRemove={handleRemoveAudio} />
            )}
            <TranscribeButton onClick={handleTranscribe} disabled={!file} />
            {transcribedText && <TranscribedText text={transcribedText} />}
        </div>
    );
};

export default TranscricaoAudio;
