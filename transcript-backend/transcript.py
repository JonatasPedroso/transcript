import os
import subprocess
import tempfile
import threading
import time
import warnings

import torch
import whisper
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from pydub import AudioSegment

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", ping_timeout=7200, ping_interval=25)

# Global variable to store the loaded model
model = None

def save_temp_audio_file(audio_data):
    socketio.emit('progress_update', {'stage': 'Iniciando salvamento do arquivo de áudio temporário', 'progress': 5})
    start_time = time.time()
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_filename = tmp_file.name
        tmp_file.write(audio_data)
    end_time = time.time()
    print(f"save_temp_audio_file took {end_time - start_time:.2f} seconds")
    socketio.emit('progress_update', {'stage': 'Salvamento do arquivo de áudio temporário concluído', 'progress': 15})
    return tmp_filename

def convert_to_wav(file):
    socketio.emit('progress_update', {'stage': 'Iniciando conversão para wav', 'progress': 20})
    start_time = time.time()
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_filename = tmp_file.name + ".wav"
        tmp_file.close()
        command = [
            'ffmpeg', '-i', file, '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', tmp_filename
        ]
        subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    end_time = time.time()
    print(f"convert_to_wav took {end_time - start_time:.2f} seconds")
    socketio.emit('progress_update', {'stage': 'Conversão para wav concluída', 'progress': 30})
    return tmp_filename

def load_whisper_model(model_name, device):
    start_time = time.time()
    model_path = os.path.expanduser(f'~/.cache/whisper/{model_name}.pt')
    if os.path.exists(model_path):
        os.remove(model_path)
        print(f"Deleted corrupted model file: {model_path}")
    model = whisper.load_model(model_name, device=device).to(device)
    end_time = time.time()
    print(f"load_whisper_model took {end_time - start_time:.2f} seconds")
    return model

def split_audio(file, segment_length=600000):  # 10 minutes per segment
    audio = AudioSegment.from_wav(file)
    segments = [audio[i:i + segment_length] for i in range(0, len(audio), segment_length)]
    segment_files = []
    for i, segment in enumerate(segments):
        segment_file = f"{file}_segment_{i}.wav"
        segment.export(segment_file, format="wav")
        segment_files.append(segment_file)
    return segment_files

def transcribe_segment(model, segment_file, results, index, total_segments):
    result = perform_transcription(model, segment_file)
    results[index] = result
    os.remove(segment_file)
    progress = 55 + (20 * (index + 1) / total_segments)
    socketio.emit('progress_update', {'stage': f'Transcrição em andamento {index + 1}/{total_segments} concluída', 'progress': progress})

def transcribe_audio(data):
    try:
        print("Starting transcription thread...")
        audio_data = data['audio']
        if not audio_data:
            print("No audio data received")
            socketio.emit('transcription_error', {'error': "Nenhum dado de áudio recebido."})
            return
        tmp_filename = save_temp_audio_file(audio_data)
        wav_file = convert_to_wav(tmp_filename)
        segment_files = split_audio(wav_file)
        total_segments = len(segment_files)
        results = [None] * total_segments
        threads = []

        for i, segment_file in enumerate(segment_files):
            thread = threading.Thread(target=transcribe_segment, args=(model, segment_file, results, i, total_segments))
            threads.append(thread)
            thread.start()

        for thread in threads:
            thread.join()

        transcription = " ".join(results)
        cleanup_temp_files([tmp_filename, wav_file])
        emit_transcription_result(transcription)
    except Exception as e:
        print(f"Error during transcription: {e}")
        socketio.emit('transcription_error', {'error': "Erro ao transcrever o áudio."})

def get_device():
    return "cuda" if torch.cuda.is_available() else "cpu"

def perform_transcription(model, wav_file):
    socketio.emit('progress_update', {'stage': 'Iniciando transcrição', 'progress': 55})
    start_time = time.time()
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", UserWarning)
        result = model.transcribe(wav_file, language="pt", temperature=0.0, word_timestamps=True)
    end_time = time.time()
    print(f"perform_transcription took {end_time - start_time:.2f} seconds")
    return result["text"]

def cleanup_temp_files(files):
    socketio.emit('progress_update', {'stage': 'Iniciando limpeza dos arquivos temporários', 'progress': 90})
    start_time = time.time()
    for file in files:
        os.remove(file)
    end_time = time.time()
    print(f"cleanup_temp_files took {end_time - start_time:.2f} seconds")
    socketio.emit('progress_update', {'stage': 'Limpeza dos arquivos temporários concluída', 'progress': 95})

def emit_transcription_result(transcription):
    socketio.emit('progress_update', {'stage': 'Transcrição completa', 'progress': 100})
    socketio.emit('transcription_complete', {'text': transcription, 'progress': 100})
    print("Transcription result emitted")

@socketio.on('start_transcription')
def handle_transcription(data):
    print("Received transcription request")
    transcription_thread = threading.Thread(target=transcribe_audio, args=(data,))
    transcription_thread.start()
    print("Transcription thread started")

if __name__ == '__main__':
    print("Starting server...")
    device = get_device()
    model = load_whisper_model("turbo", device)
    print("Whisper model loaded and ready to use")
    socketio.run(app, debug=True, port=5000)