import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Play } from 'lucide-react';
import { cn } from '../../utils/cn';

export const InterviewSession: React.FC = () => {
    const navigate = useNavigate();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    // Simulate AI speaking effect
    const [displayedText, setDisplayedText] = useState("");
    const [status, setStatus] = useState<'listening' | 'speaking' | 'processing'>('speaking');
    const [transcript, setTranscript] = useState<{ role: 'ai' | 'user', text: string }[]>([
        { role: 'ai', text: "Hello! Welcome to your technical mock interview. I'm your AI interviewer today. To get started, could you please introduce yourself and tell me a bit about your background in software development?" }
    ]);

    useEffect(() => {
        const lastMsg = transcript[transcript.length - 1];
        if (lastMsg.role === 'ai') {
            let i = 0;
            const timer = setInterval(() => {
                setDisplayedText(lastMsg.text.substring(0, i));
                i++;
                if (i > lastMsg.text.length) clearInterval(timer);
            }, 30);
            return () => clearInterval(timer);
        } else {
            setDisplayedText(lastMsg.text);
        }
    }, [transcript]);

    const handleEndCall = () => {
        if (confirm("End this interview session?")) {
            navigate('/student/communication');
        }
    };

    const simulateUserResponse = () => {
        setStatus('listening');
        setTimeout(() => {
            const userResponse = "Hi, I'm a computer science student specializing in web development. I have experience with React and Node.js, and I recently built a full-stack project for managing library books.";
            setTranscript(prev => [...prev, { role: 'user', text: userResponse }]);
            setStatus('processing');

            setTimeout(() => {
                setTranscript(prev => [...prev, { role: 'ai', text: "That's great! React and Node.js are a powerful combination. Can you explain a challenging problem you faced while building that library project and how you solved it?" }]);
                setStatus('speaking');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="flex bg-slate-900 h-[calc(100vh-theme(spacing.24))] -m-8 relative overflow-hidden text-white">
            {/* Main Video Area */}
            <div className="flex-1 flex flex-col p-4 relative z-10">
                <div className="flex-1 rounded-3xl bg-slate-800 border border-slate-700 relative overflow-hidden shadow-2xl">
                    {/* Simulated Camera Feed */}
                    {isCameraOn ? (
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2960&auto=format&fit=crop')] bg-cover bg-center opacity-80" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                            <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center text-4xl font-bold text-slate-500">
                                YOU
                            </div>
                        </div>
                    )}

                    {/* AI Avatar Overlay (Picture-in-Picture style) */}
                    <div className="absolute top-6 right-6 w-48 h-36 bg-black rounded-2xl border-2 border-slate-600 overflow-hidden shadow-lg z-20">
                        <div className="w-full h-full bg-indigo-900 relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-800 to-slate-900"></div>
                            {/* Animated AI Visualizer */}
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={cn(
                                        "w-2 bg-blue-400 rounded-full animate-bounce",
                                        status === 'speaking' ? "h-8" : "h-2"
                                    )} style={{ animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-black/50 rounded text-slate-300">AI Interviewer</div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-6 left-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", status === 'listening' ? "bg-red-500" : "bg-green-500")}></div>
                            <span className="text-sm font-medium tracking-wide uppercase">{status}</span>
                        </div>
                    </div>

                    {/* Captions Overlay */}
                    <div className="absolute bottom-12 left-0 right-0 px-12 text-center pointer-events-none">
                        <p className="text-2xl font-medium text-white/90 drop-shadow-lg leading-relaxed max-w-4xl mx-auto">
                            "{displayedText}"
                        </p>
                    </div>
                </div>

                {/* Control Bar */}
                <div className="h-24 flex items-center justify-between px-8">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Connected &bull; 00:01:24
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMicOn(!isMicOn)}
                            className={cn(
                                "p-4 rounded-full transition-all duration-200 shadow-lg",
                                isMicOn ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                            )}
                        >
                            {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={() => setIsCameraOn(!isCameraOn)}
                            className={cn(
                                "p-4 rounded-full transition-all duration-200 shadow-lg",
                                isCameraOn ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                            )}
                        >
                            {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={handleEndCall}
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all active:scale-95"
                        >
                            <PhoneOff className="w-5 h-5" />
                            End Interview
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-slate-300">
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar (Transcript / Feedback) */}
            <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col z-20 shadow-2xl">
                <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                    <h3 className="font-bold text-white">Live Transcript</h3>
                    <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded uppercase">Beta</div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {transcript.map((msg, i) => (
                        <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                msg.role === 'ai' ? "bg-indigo-600" : "bg-slate-600"
                            )}>
                                {msg.role === 'ai' ? "AI" : "YOU"}
                            </div>
                            <div className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed max-w-[80%]",
                                msg.role === 'ai'
                                    ? "bg-indigo-900/40 text-indigo-100 rounded-tl-none border border-indigo-500/20"
                                    : "bg-slate-700 text-slate-100 rounded-tr-none"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Demo Control for Reviewers */}
                    {status === 'speaking' && transcript.length < 3 && (
                        <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 text-center">
                            <p className="text-xs text-slate-500 mb-3">Simulation Controls</p>
                            <button
                                onClick={simulateUserResponse}
                                className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4" /> Simulate Answer
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-700">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 border border-slate-700">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mx-2"></div>
                        <input
                            type="text"
                            disabled
                            placeholder="Listening..."
                            className="bg-transparent border-0 focus:ring-0 text-slate-400 text-sm w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
