import React from 'react';

interface TranscribedTextProps {
    text: string;
}

const TranscribedText: React.FC<TranscribedTextProps> = ({ text }) => (
    <div className="mt-6">
        <h2 className="text-lg md:text-xl font-semibold mb-2 text-black">Texto Transcrito</h2>
        <textarea
            value={text}
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg text-black"
        />
    </div>
);

export default TranscribedText;
