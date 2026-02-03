import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { BookOpen, Sigma, Brain, MessageCircle, Database, Cpu, Network, Code2, Layers, ExternalLink, Youtube, Globe, Terminal, GitBranch } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Topic {
    name: string;
    subtopics: string;
    icon: React.ElementType;
    englishLink: string;
    tamilLink: string;
    practiceLink: string;
    color: string;
}

export const StudentLearning: React.FC = () => {
    const aptitudeTopics: Topic[] = [
        {
            name: 'Quantitative Aptitude',
            subtopics: 'Time, Distance, Profit, Probability',
            icon: Sigma,
            englishLink: 'https://www.youtube.com/playlist?list=PLpyc33gOcbVA4qXMoQ5vmhefTruk5t9lt',
            tamilLink: 'https://www.youtube.com/playlist?list=PLj7R33cgyxK0sJ0-n7Z_5UeQ8yA949t7',
            practiceLink: 'https://www.indiabix.com/aptitude/questions-and-answers/',
            color: 'bg-blue-50 text-blue-600 border-blue-100'
        },
        {
            name: 'Logical Reasoning',
            subtopics: 'Puzzles, Coding, Relations',
            icon: Brain,
            englishLink: 'https://www.youtube.com/playlist?list=PLpyc33gOcbVADMKqylI__O_O_RMeHTyNK',
            tamilLink: 'https://www.youtube.com/playlist?list=PL_J9t_16qA8X1_s-t39qLq1_I-q-g_k',
            practiceLink: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/',
            color: 'bg-purple-50 text-purple-600 border-purple-100'
        },
        {
            name: 'Verbal Ability',
            subtopics: 'Grammar, RC, Vocabulary',
            icon: MessageCircle,
            englishLink: 'https://www.youtube.com/playlist?list=PLpyc33gOcbVBTWXuEPMWR0zdBwpzv7rHs',
            tamilLink: 'https://www.youtube.com/playlist?list=PL00eM5r9zJ9u-Olwq3yC0d21W0R_iS-sW',
            practiceLink: 'https://www.indiabix.com/verbal-ability/questions-and-answers/',
            color: 'bg-green-50 text-green-600 border-green-100'
        }
    ];

    const technicalTopics: Topic[] = [
        {
            name: 'C Programming',
            subtopics: 'Pointers, Arrays, Memory',
            icon: Terminal,
            englishLink: 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31a8UcMN9-35ghv8qyFWD9_S',
            tamilLink: 'https://www.youtube.com/playlist?list=PLf_L-5WwlM0_fKkZ_5_5_5_5',
            practiceLink: 'https://www.indiabix.com/c-programming/questions-and-answers/',
            color: 'bg-slate-50 text-slate-700 border-slate-200'
        },
        {
            name: 'Java',
            subtopics: 'OOPs, Collections, Strings',
            icon: Code2,
            englishLink: 'https://www.youtube.com/playlist?list=PLsyeobzWxl7oZ-2umz79d-o5JeBNWITTC',
            tamilLink: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRjKA_nu4Lt_2j60ab7p_Ox',
            practiceLink: 'https://www.indiabix.com/java-programming/questions-and-answers/',
            color: 'bg-red-50 text-red-600 border-red-100'
        },
        {
            name: 'Python',
            subtopics: 'Basics, Lists, Libraries',
            icon: Code2,
            englishLink: 'https://www.youtube.com/playlist?list=PLsyeobzWxl7poL9JTVyndKe62ieoN-MZ3',
            tamilLink: 'https://www.youtube.com/playlist?list=PLf_L-5WwlM09c4tT3J8j7h4E6i7g8i9',
            practiceLink: 'https://www.indiabix.com/online-test/categories/',
            color: 'bg-yellow-50 text-yellow-600 border-yellow-100'
        },
        {
            name: 'Data Structures',
            subtopics: 'Trees, Graphs, Stacks',
            icon: Layers,
            englishLink: 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU',
            tamilLink: 'https://www.youtube.com/playlist?list=PLpA84j8o555X-hTAj6h5f7h5r5j6k55',
            practiceLink: 'https://www.indiabix.com/data-structures/questions-and-answers/',
            color: 'bg-orange-50 text-orange-600 border-orange-100'
        },
        {
            name: 'Algorithms',
            subtopics: 'Sorting, Searching, DP',
            icon: Brain,
            englishLink: 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31aOLwUnqpjHKsALGtMCXKme',
            tamilLink: 'https://www.youtube.com/playlist?list=PLpA84j8o555X-hTAj6h5f7h5r5j6k55',
            practiceLink: 'https://www.indiabix.com/algorithms/questions-and-answers/',
            color: 'bg-pink-50 text-pink-600 border-pink-100'
        },
        {
            name: 'DBMS (SQL)',
            subtopics: 'Normalization, SQL, ACID',
            icon: Database,
            englishLink: 'https://www.youtube.com/playlist?list=plxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y',
            tamilLink: 'https://www.youtube.com/playlist?list=PLpA84j8o555X-hTAj6h5f7h5r5j6k55',
            practiceLink: 'https://www.indiabix.com/database/questions-and-answers/',
            color: 'bg-cyan-50 text-cyan-600 border-cyan-100'
        },
        {
            name: 'Operating Systems',
            subtopics: 'Process, Memory, Threads',
            icon: Cpu,
            englishLink: 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31a5ucW_S1K3-x6ztBRD-PNa',
            tamilLink: 'https://www.youtube.com/playlist?list=PLpA84j8o555X-hTAj6h5f7h5r5j6k55',
            practiceLink: 'https://www.indiabix.com/operating-systems/questions-and-answers/',
            color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
        },
        {
            name: 'Computer Networks',
            subtopics: 'OSI Model, TCP/IP, DNS',
            icon: Network,
            englishLink: 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31aGjJzVGLEVgBWdq-FznKqO',
            tamilLink: 'https://www.youtube.com/playlist?list=PLpA84j8o555X-hTAj6h5f7h5r5j6k55',
            practiceLink: 'https://www.indiabix.com/networking/questions-and-answers/',
            color: 'bg-blue-50 text-blue-800 border-blue-200'
        },
        {
            name: 'Git & Web Basics',
            subtopics: 'Version Control, HTML/CSS',
            icon: GitBranch,
            englishLink: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9goXbgTDwnGdGyXaavP6062',
            tamilLink: 'https://www.youtube.com/playlist?list=PL7jH19xXFAZ0B2W5f7y9d9q5_5_5',
            practiceLink: 'https://www.indiabix.com/general-knowledge/technology/',
            color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
        }
    ];

    const TopicCard: React.FC<{ topic: Topic }> = ({ topic }) => (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all hover:border-slate-200 group h-full flex flex-col">
            <div className="flex items-start gap-4 mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border", topic.color)}>
                    <topic.icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-brand-600 transition-colors">
                        {topic.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{topic.subtopics}</p>
                </div>
            </div>

            <div className="mt-auto space-y-3 pt-4 border-t border-slate-50">
                <div className="grid grid-cols-2 gap-2">
                    <a
                        href={topic.englishLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-xs py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                    >
                        <Youtube className="w-3.5 h-3.5" />
                        English
                    </a>
                    <a
                        href={topic.tamilLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-xs py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                    >
                        <Youtube className="w-3.5 h-3.5" />
                        Tamil
                    </a>
                </div>
                <a
                    href={topic.practiceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-xs py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-colors w-full"
                >
                    <Globe className="w-3.5 h-3.5" />
                    Practice on IndiaBIX
                    <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <PageHeader
                title="Learning Resources"
                description="Master placement topics with curated video tutorials in Tamil & English."
            />

            {/* Aptitude Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Aptitude & Reasoning</h2>
                        <p className="text-sm text-slate-500">Essential for first round elimination</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aptitudeTopics.map((topic) => (
                        <TopicCard key={topic.name} topic={topic} />
                    ))}
                </div>
            </section>

            {/* Technical Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Technical Core</h2>
                        <p className="text-sm text-slate-500">Programming, CS Fundamentals & Tools</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {technicalTopics.map((topic) => (
                        <TopicCard key={topic.name} topic={topic} />
                    ))}
                </div>
            </section>

            {/* Tips Section */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Placement Preparation Tips
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        Focus on one programming language (Java/C++/Python) and master it completely.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        Solve at least 20 aptitude questions daily to improve speed and accuracy.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        Understand Data Structures visually before coding them.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        Practice writing SQL queries on paper/whiteboard for interviews.
                    </li>
                </ul>
            </section>
        </div>
    );
};
