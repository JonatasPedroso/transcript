import React, {useEffect, useState} from 'react';
import Alert from './Alert';
import DropZone from './DropZone';
import AudioPreview from './AudioPreview';
import TranscribedText from './TranscribedText';
import TranscribeButton from './TranscribeButton';

const TranscricaoAudio: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string>('');
    const [transcribedText, setTranscribedText] = useState<string>(() => {
        return localStorage.getItem('transcribedText') || '';
    });
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            let interval: NodeJS.Timeout | null = null;
            if (alertVisible) {
                interval = setInterval(() => {
                    setTimer(prevTimer => prevTimer + 1);
                }, 1000);
            } else if (!alertVisible && timer !== 0) {
                clearInterval(interval!);
                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);
                    setTimer(0);
                }, 5000);
            }
            return () => {
                clearInterval(interval!);
            };
        }
    }, [alertVisible]);

    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const handleFileSelected = (selectedFile: File) => {
        setFile(selectedFile);
        setFileUrl(URL.createObjectURL(selectedFile));
        setTranscribedText('');
        localStorage.removeItem('transcribedText');
    };

    const handleRemoveAudio = () => {
        setFile(null);
        setFileUrl('');
        setTranscribedText('');
        localStorage.removeItem('transcribedText');
    };

    const handleTranscribe = async () => {
        if (!file) return;

        setAlertVisible(true);
        setTimer(0);
        setIsLoading(true);

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
                localStorage.setItem('transcribedText', result.text);
                showNotification('Transcrição Concluída', 'A transcrição do áudio foi concluída com sucesso.');
            } else {
                alert("Erro ao transcrever o áudio.");
            }
        } catch (error) {
            console.error("Erro na comunicação com o servidor:", error);
            alert("Erro na comunicação com o servidor.");
        } finally {
            setAlertVisible(false);
            setIsLoading(false);
        }
    };

    const showNotification = (title: string, body: string) => {
        if (Notification.permission === 'granted') {
            new Notification(title, {body, requireInteraction: true});
        }
    };

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTranscribedText(event.target.value);
    };

    return (
        <div>
            <Alert visible={alertVisible || showAlert} text="Transcrição em progresso" timer={timer}/>
            <DropZone onFileSelected={handleFileSelected}/>
            {file && (
                <AudioPreview fileName={file.name} fileUrl={fileUrl} onRemove={handleRemoveAudio}/>
            )}
            <TranscribeButton onClick={handleTranscribe} disabled={!file || isLoading} isLoading={isLoading}/>
            {transcribedText && <TranscribedText text={transcribedText} onChange={handleTextChange}/>}
        </div>
    );
};

export default TranscricaoAudio;