import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Alert from './Alert';
import DropZone from './DropZone';
import AudioPreview from './AudioPreview';
import TranscribedText from './TranscribedText';
import TranscribeButton from './TranscribeButton';

const socket = io('http://localhost:5000');

const TranscricaoAudio: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string>('');
    const [transcribedText, setTranscribedText] = useState<string>(() => {
        return localStorage.getItem('transcribedText') ?? '';
    });
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showProgress, setShowProgress] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [stage, setStage] = useState<string>('');
    const [prevProgress, setPrevProgress] = useState<number>(0);

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

    useEffect(() => {
        socket.on('progress_update', (data) => {
            const { stage, progress } = data;
            setStage(stage);
            animateProgress(progress);
            console.log(`Stage: ${stage}, Progress: ${progress}%`);
        });

        socket.on('transcription_complete', (data) => {
            setTranscribedText(data.text);
            localStorage.setItem('transcribedText', data.text);
            showNotification('Transcrição Concluída', 'A transcrição do áudio foi concluída com sucesso.');
            setAlertVisible(false);
            setIsLoading(false);
            setTimeout(() => {
                setStage('');
                animateProgress(0);
                setShowProgress(false);
                animateProgress(100);
            }, 5000);
        });

        socket.on('transcription_error', (data) => {
            alert(data.error);
            setAlertVisible(false);
            setIsLoading(false);
            setShowProgress(false);
        });

        return () => {
            socket.off('progress_update');
            socket.off('transcription_complete');
            socket.off('transcription_error');
        };
    }, []);

    const animateProgress = (newProgress: number) => {
        if (newProgress <= prevProgress) return;

        console.log(`Animating progress from ${prevProgress} to ${newProgress}`);

        const duration = 1000;
        const stepTime = 10;
        const steps = duration / stepTime;
        const increment = (newProgress - prevProgress) / steps;
        let currentProgress = prevProgress;

        const interval = setInterval(() => {
            currentProgress += increment;
            setProgress(Math.min(currentProgress, newProgress));
            console.log(`Current progress: ${currentProgress}`);
            if (currentProgress >= newProgress) {
                clearInterval(interval);
                setPrevProgress(newProgress);
                console.log(`Animation complete. Progress: ${newProgress}`);
            }
        }, stepTime);
    };

    const handleFileSelected = (selectedFile: File) => {
        setFile(selectedFile);
        setFileUrl(URL.createObjectURL(selectedFile));
        setTranscribedText('');
        animateProgress(0);
        localStorage.removeItem('transcribedText');
    };

    const handleRemoveAudio = () => {
        setFile(null);
        setFileUrl('');
        setTranscribedText('');
        localStorage.removeItem('transcribedText');
    };

    const handleTranscribe = () => {
        if (!file) return;

        setAlertVisible(true);
        setTimer(0);
        setIsLoading(true);
        localStorage.removeItem('transcribedText');

        const reader = new FileReader();
        reader.onload = () => {
            const fileData = reader.result;
            socket.emit('start_transcription', { audio: fileData });
            setShowProgress(true);
        };
        reader.readAsArrayBuffer(file);
    };

    const showNotification = (title: string, body: string) => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body, requireInteraction: true });
        }
    };

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTranscribedText(event.target.value);
    };

    return (
      <div>
          <Alert visible={alertVisible || showAlert} text="Transcrição em progresso" timer={timer} />
          <DropZone onFileSelected={handleFileSelected} />
          {file && (
            <AudioPreview fileName={file.name} fileUrl={fileUrl} onRemove={handleRemoveAudio} />
          )}
          <TranscribeButton onClick={handleTranscribe} disabled={!file || isLoading} isLoading={isLoading} />
          {showProgress && (
            <div className="w-full rounded-full h-4 mb-4 mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-width duration-1000 ease-linear"
                         style={{width: `${progress}%`}}></div>
                </div>
                <div
                  className="flex justify-between mb-1 transition-opacity duration-500 ease-in-out transform translate-y-0 opacity-100">
                    <span className="text-base font-medium text-black">{stage}</span>
                    <span className="text-sm font-medium text-black">{progress.toFixed(0)}%</span>
                </div>
            </div>
          )}
          {transcribedText && <TranscribedText text={transcribedText} onChange={handleTextChange}/>}
      </div>
    );
};

export default TranscricaoAudio;