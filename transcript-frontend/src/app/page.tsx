"use client";

import React, { useEffect, useState } from 'react';
import TranscricaoAudio from "@/app/components/TranscricaoAudio";

const HomePage: React.FC = () => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl">
            {isClient && <TranscricaoAudio />}
        </div>
    );
};

export default HomePage;
