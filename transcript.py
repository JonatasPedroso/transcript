import os
from flask import Flask, request, jsonify
import speech_recognition as sr
import subprocess
import tempfile
from flask_cors import CORS

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

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['audio']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = file.filename.lower()
    valid_extensions = ['.opus', '.dat', '.m4a']
    
    if any(filename.endswith(ext) for ext in valid_extensions):
        recognizer = sr.Recognizer()

        try:
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                tmp_filename = tmp_file.name
                file.save(tmp_filename)

            wav_file = convert_to_wav(tmp_filename)

            with sr.AudioFile(wav_file) as source:
                audio = recognizer.record(source)
                text = recognizer.recognize_google(audio, language="pt-BR")

            os.remove(tmp_filename)
            os.remove(wav_file)

            return jsonify({"text": text})

        except sr.UnknownValueError:
            return jsonify({"error": "Could not understand the audio"}), 400
        except sr.RequestError as e:
            return jsonify({"error": f"Could not request results; {e}"}), 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    else:
        return jsonify({"error": "Unsupported file type"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
