import os
import whisper
import torch
from flask import Flask, request, jsonify
import tempfile
import subprocess
from flask_cors import CORS
import warnings

app = Flask(__name__)
CORS(app)

def convert_to_wav(file):
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_filename = tmp_file.name + ".wav"
        tmp_file.close()
        command = [
            'ffmpeg', '-i', file, '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', tmp_filename
        ]
        subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return tmp_filename

def load_whisper_model(model_name, device):
    model_path = os.path.expanduser(f'~/.cache/whisper/{model_name}.pt')
    if os.path.exists(model_path):
        os.remove(model_path)
        print(f"Deleted corrupted model file: {model_path}")
    return whisper.load_model(model_name, device=device).to(device)

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    filename = file.filename.lower()
    valid_extensions = ['.opus', '.dat', '.m4a']

    if any(filename.endswith(ext) for ext in valid_extensions):
        try:
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                tmp_filename = tmp_file.name
                file.save(tmp_filename)

            wav_file = convert_to_wav(tmp_filename)

            device = "cuda" if torch.cuda.is_available() else "cpu"
            model = load_whisper_model("large", device)

            with warnings.catch_warnings():
                warnings.simplefilter("ignore", UserWarning)
                result = model.transcribe(wav_file, language="pt", temperature=0.0, word_timestamps=True)

            os.remove(tmp_filename)
            os.remove(wav_file)

            transcription = result["text"]

            return jsonify({"text": transcription})

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    else:
        return jsonify({"error": "Tipo de arquivo não suportado"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)