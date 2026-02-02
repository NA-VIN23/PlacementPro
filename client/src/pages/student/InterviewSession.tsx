import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useVoiceAssistant,
    BarVisualizer,
    VoiceAssistantControlBar,
    useConnectionState,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { Mic, PhoneOff, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface InterviewConfig {
    token: string;
    roomName: string;
    livekitUrl: string;
    interviewId: string;
}

// Voice Assistant UI Component
const VoiceAssistantUI: React.FC<{ onEnd: () => void }> = ({ onEnd }) => {
    const { state, audioTrack } = useVoiceAssistant();

    const getStateText = () => {
        switch (state) {
            case 'listening': return 'Listening...';
            case 'thinking': return 'Thinking...';
            case 'speaking': return 'AI Speaking...';
            default: return 'Connecting...';
        }
    };

    const getStateColor = () => {
        switch (state) {
            case 'listening': return 'text-green-400';
            case 'thinking': return 'text-yellow-400';
            case 'speaking': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            {/* AI Avatar / Visualizer */}
            <div className="relative">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                    {audioTrack ? (
                        <BarVisualizer
                            state={state}
                            barCount={5}
                            trackRef={audioTrack}
                            style={{ width: '8rem', height: '8rem' }}
                        />
                    ) : (
                        <Mic className="w-16 h-16 text-white animate-pulse" />
                    )}
                </div>

                {/* Status Ring */}
                <div className={`absolute inset-0 rounded-full border-4 ${state === 'listening' ? 'border-green-400 animate-pulse' :
                    state === 'speaking' ? 'border-blue-400' :
                        'border-gray-600'
                    }`} style={{ pointerEvents: 'none' }} />
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2">
                <p className={`text-2xl font-bold ${getStateColor()}`}>
                    {getStateText()}
                </p>
                <p className="text-gray-400 text-sm">
                    {state === 'listening' ? 'Speak your answer...' :
                        state === 'speaking' ? 'Listen carefully...' :
                            'Processing...'}
                </p>
            </div>

            {/* Control Bar */}
            <div className="flex items-center gap-4">
                <VoiceAssistantControlBar />

                <button
                    onClick={onEnd}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                    <PhoneOff className="w-5 h-5" />
                    End Interview
                </button>
            </div>
        </div>
    );
};

// Connection Status Component
const ConnectionStatus: React.FC = () => {
    const connectionState = useConnectionState();

    if (connectionState === ConnectionState.Connected) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Connected</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full">
            <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
            <span className="text-yellow-400 text-sm font-medium">Connecting...</span>
        </div>
    );
};

export const InterviewSession: React.FC = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState<InterviewConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        startInterview();
    }, []);

    const startInterview = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('placement_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/interviews/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to start interview');
            }

            const data = await response.json();
            setConfig({
                token: data.token,
                roomName: data.roomName,
                livekitUrl: data.livekitUrl || 'wss://placementpro.livekit.cloud',
                interviewId: data.interviewId,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start interview');
        } finally {
            setLoading(false);
        }
    };

    const endInterview = async () => {
        if (!config) return;

        try {
            const token = localStorage.getItem('placement_token');
            await fetch(`${API_BASE_URL}/interviews/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ interviewId: config.interviewId }),
            });
        } catch (err) {
            console.error('Failed to end interview:', err);
        }

        navigate('/student/communication');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
                    <p className="text-white text-lg">Preparing your interview session...</p>
                </div>
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-red-400 text-lg">{error || 'Configuration error'}</p>
                    <button
                        onClick={() => navigate('/student/communication')}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">AI Interview Session</h1>
                        <p className="text-slate-400 text-sm">Speak naturally - the AI will listen and respond</p>
                    </div>
                </div>
            </div>

            {/* LiveKit Room */}
            <div className="max-w-4xl mx-auto p-6">
                <LiveKitRoom
                    token={config.token}
                    serverUrl={config.livekitUrl}
                    connect={true}
                    audio={true}
                    video={false}
                    className="bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50"
                >
                    <div className="absolute top-4 right-4">
                        <ConnectionStatus />
                    </div>
                    <VoiceAssistantUI onEnd={endInterview} />
                    <RoomAudioRenderer />
                </LiveKitRoom>
            </div>

            {/* Tips */}
            <div className="max-w-4xl mx-auto px-6 pb-8">
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">💡 Tips for a great interview:</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Speak clearly and at a normal pace</li>
                        <li>• Wait for the AI to finish before responding</li>
                        <li>• Use the STAR method for behavioral questions</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
