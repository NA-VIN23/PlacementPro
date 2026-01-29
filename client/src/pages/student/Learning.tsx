import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { BookOpen, Sigma, Brain, MessageCircle, Database, Cpu, Network, Code2, Layers, ExternalLink, Youtube, Globe } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Topic {
    name: string;
    icon: React.ElementType;
    youtubeLink: string;
    practiceLink: string;
    color: string;
}

export const StudentLearning: React.FC = () => {
    const aptitudeTopics: Topic[] = [
        {
            name: 'Quantitative Aptitude',
            icon: Sigma,
            youtubeLink: 'https://www.youtube.com/playlist?list=PLpyc33gOcbVA4qXMoQ5vmhefTruk5t9lt',
            practiceLink: 'https://www.indiabix.com/aptitude/questions-and-answers/',
            color: 'bg-blue-50 text-blue-600 border-blue-100'
        },
        {
            name: 'Logical Reasoning',
            icon: Brain,
            youtubeLink: 'https://www.youtube.com/playlist?list=PLpyc33gOcbVADMKqylI__O_O_RMeHTyNK',
            practiceLink: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/',
            color: 'bg-purple-50 text-purple-600 border-purple-100'
        },
        {
            name: 'Verbal Ability',
            icon: MessageCircle,
            youtubeLink: 'https://www.youtube.com/playlist?list=PLpyc33gOcbVBTWXuEPMWR0zdBwpzv7rHs',
            practiceLink: 'https://www.indiabix.com/verbal-ability/questions-and-answers/',
            color: 'bg-green-50 text-green-600 border-green-100'
        }
    ];

    const technicalTopics: Topic[] = [
        {
            name: 'Data Structures',
            icon: Layers,
            youtubeLink: 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU',
            practiceLink: 'https://www.indiabix.com/data-structures/questions-and-answers/',
            color: 'bg-orange-50 text-orange-600 border-orange-100'
        },
        {
            name: 'Algorithms',
            icon: Code2,
            youtubeLink: 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31aOLwUnqpjHKsALGtMCXKme',
            practiceLink: 'https://www.indiabix.com/algorithms/questions-and-answers/',
            color: 'bg-red-50 text-red-600 border-red-100'
        },
        {
            name: 'DBMS',
            icon: Database,
            youtubeLink: 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31b33kF46f9aFjoJPOkdlsRc',
            practiceLink: 'https://www.indiabix.com/database/questions-and-answers/',
            color: 'bg-cyan-50 text-cyan-600 border-cyan-100'
        },
        {
            name: 'Operating Systems',
            icon: Cpu,
            youtubeLink: 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31a5ucW_S1K3-x6ztBRD-PNa',
            practiceLink: 'https://www.indiabix.com/operating-systems/questions-and-answers/',
            color: 'bg-slate-100 text-slate-600 border-slate-200'
        },
        {
            name: 'Computer Networks',
            icon: Network,
            youtubeLink: 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31aGjJzVGLEVgBWdq-FznKqO',
            practiceLink: 'https://www.indiabix.com/networking/questions-and-answers/',
            color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
        },
        {
            name: 'OOP Concepts',
            icon: BookOpen,
            youtubeLink: 'https://www.youtube.com/playlist?list=PLsyeobzWxl7rNYE_XvXOH5HO_XN3HNSpL',
            practiceLink: 'https://www.indiabix.com/oops-concepts/questions-and-answers/',
            color: 'bg-pink-50 text-pink-600 border-pink-100'
        }
    ];

    const TopicCard: React.FC<{ topic: Topic }> = ({ topic }) => (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all hover:border-slate-200 group">
            <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", topic.color)}>
                    <topic.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base mb-3 group-hover:text-brand-600 transition-colors">
                        {topic.name}
                    </h3>
                    <div className="space-y-2">
                        <a
                            href={topic.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                        >
                            <Youtube className="w-4 h-4" />
                            Learn on YouTube
                            <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                        <a
                            href={topic.practiceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                            <Globe className="w-4 h-4" />
                            Practice on IndiaBIX
                            <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in">
            <PageHeader
                title="Learning Resources"
                description="Master placement topics with curated learning materials and practice questions."
            />

            {/* Aptitude Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Brain className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Aptitude</h2>
                        <p className="text-sm text-slate-500">Quantitative, Logical & Verbal skills</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aptitudeTopics.map((topic) => (
                        <TopicCard key={topic.name} topic={topic} />
                    ))}
                </div>
            </section>

            {/* Technical Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Technical</h2>
                        <p className="text-sm text-slate-500">Core CS concepts for technical rounds</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {technicalTopics.map((topic) => (
                        <TopicCard key={topic.name} topic={topic} />
                    ))}
                </div>
            </section>

            {/* Tips Section */}
            <section className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl p-6 border border-brand-100">
                <h3 className="font-bold text-slate-800 mb-3">💡 Learning Tips</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                        <span className="text-brand-600">•</span>
                        Watch video tutorials first to understand concepts clearly.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-brand-600">•</span>
                        Practice at least 20-30 questions per topic on IndiaBIX.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-brand-600">•</span>
                        Focus on weak areas identified in your assessment results.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-brand-600">•</span>
                        Consistency is key - dedicate 1-2 hours daily for preparation.
                    </li>
                </ul>
            </section>
        </div>
    );
};
