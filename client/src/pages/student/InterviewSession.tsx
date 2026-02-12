import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useVoiceAssistant,
    BarVisualizer,
    useConnectionState,
    useLocalParticipant,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react';

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
    const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();

    const toggleMic = async () => {
        if (localParticipant) {
            await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
        }
    };

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
        <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] space-y-8 md:space-y-12 py-8">
            {/* AI Avatar / Visualizer */}
            <div className="relative">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 transition-all duration-500">
                    {audioTrack ? (
                        <BarVisualizer
                            state={state}
                            barCount={5}
                            trackRef={audioTrack}
                            style={{ width: '100%', height: '100%' }}
                            className="text-white scale-75 md:scale-100"
                        />
                    ) : (
                        <Mic className="w-10 h-10 md:w-16 md:h-16 text-white animate-pulse" />
                    )}
                </div>

                {/* Status Ring */}
                <div className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${state === 'listening' ? 'border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.3)]' :
                    state === 'speaking' ? 'border-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.3)]' :
                        'border-white/10'
                    }`} style={{ pointerEvents: 'none' }} />
            </div>

            {/* Status Text & User Feedback */}
            <div className="text-center space-y-4 md:space-y-6">
                <div className="space-y-2">
                    <p className={`text-xl md:text-2xl font-bold transition-colors duration-300 ${getStateColor()}`}>
                        {getStateText()}
                    </p>
                    <p className="text-slate-400 text-xs md:text-sm">
                        {state === 'listening' ? 'Speak clearly while the ring is green' :
                            state === 'speaking' ? 'Listen to the response' :
                                'Processing your input...'}
                    </p>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleMic}
                    className={`px-6 py-3 md:px-8 md:py-4 rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all group text-sm md:text-base border ${isMicrophoneEnabled
                        ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        }`}
                >
                    {isMicrophoneEnabled ? (
                        <>
                            <Mic className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                            <span>Mute</span>
                        </>
                    ) : (
                        <>
                            <MicOff className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                            <span>Unmute</span>
                        </>
                    )}
                </button>

                <button
                    onClick={onEnd}
                    className="px-6 py-3 md:px-8 md:py-4 bg-red-500 hover:bg-red-600 text-white border border-red-500 rounded-2xl font-bold flex items-center gap-2 md:gap-3 transition-all group text-sm md:text-base shadow-lg shadow-red-500/20"
                >
                    <PhoneOff className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
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
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
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
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">AI Interview Session</h1>
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
                        className="bg-white/5 rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl"
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
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 checkbox-list">
                        <h3 className="text-sm font-semibold text-blue-200 mb-2 flex items-center gap-2">
                            <span className="text-lg">💡</span> Tips for a great interview:
                        </h3>
                        <ul className="text-sm text-slate-400 space-y-1 ml-1">
                            <li>• Speak clearly and at a normal pace</li>
                            <li>• Wait for the AI to finish before responding</li>
                            <li>• Use the STAR method for behavioral questions</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
