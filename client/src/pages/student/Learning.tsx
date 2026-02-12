import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Youtube, Globe, ArrowRight, ChevronLeft, Sigma, BrainCircuit, MessageSquareQuote, Terminal, Code2, Database, Layers, Network, GitBranch, Cpu, Search, BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Topic {
    id: string;
    title: string;
    english?: string;
    tamil?: string;
    practice: string;
}

const quantTopics: Topic[] = [
    { id: '1', title: 'Percentages', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvvqaKSM-ZkwAqUyjyR402HH', tamil: 'https://youtube.com/playlist?list=PLOoogDtEDyvvqaKSM-ZkwAqUyjyR402HH', practice: 'https://www.indiabix.com/aptitude/percentage/' },
    { id: '2', title: 'Profit & Loss', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvvgDHep2Rsd5RUTDGstbuc8', tamil: 'https://youtube.com/playlist?list=PL1lPSVzW89HZJLYTNvTx2fWfQRlv7K4Sc', practice: 'https://www.indiabix.com/aptitude/profit-and-loss/' },
    { id: '3', title: 'Simple Interest', english: 'https://youtube.com/playlist?list=PLRY2iPyYS3H6J7luQA_WVXiJ7tmQBx_0J', tamil: 'https://youtube.com/playlist?list=PL356ZrHYhxT17YUNMRKjJSeGdZXEHtlnx', practice: 'https://www.indiabix.com/aptitude/simple-interest/' },
    { id: '4', title: 'Compound Interest', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvudcQ9ODIyJUTEc2xjWupvi', tamil: 'https://youtube.com/playlist?list=PLOoogDtEDyvudcQ9ODIyJUTEc2xjWupvi', practice: 'https://www.indiabix.com/aptitude/compound-interest/' },
    { id: '5', title: 'Time & Distance', english: 'https://youtube.com/playlist?list=PLqiY6XcSKzLJa2tTeB6mKobBdE8cLqv6c', tamil: 'https://youtube.com/playlist?list=PLqiY6XcSKzLJa2tTeB6mKobBdE8cLqv6c', practice: 'https://www.indiabix.com/aptitude/time-and-distance/' },
    { id: '6', title: 'Boats & Streams', english: 'https://youtu.be/Agnaf5cv9lY', tamil: 'https://youtube.com/playlist?list=PLq2bY7pi40i_w5PZHqBhBd0SToczJm970', practice: 'https://www.indiabix.com/aptitude/boats-and-streams/' },
    { id: '7', title: 'Time & Work', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvtbV-jgkZ0-i-PS2oUmSHk4', tamil: 'https://youtube.com/playlist?list=PL1lPSVzW89HbbNNM-EYQDpvuqW0BxkpzB', practice: 'https://www.indiabix.com/aptitude/time-and-work/' },
    { id: '8', title: 'Pipes & Cisterns', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvu3PRJ8KFbOQdY0dxnBmDtH', tamil: 'https://youtube.com/playlist?list=PL1lPSVzW89Hb_KEyB25cPEqsD_wTeLXHc', practice: 'https://www.indiabix.com/aptitude/pipes-and-cisterns/' },
    { id: '9', title: 'Averages', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvuxpbUckKYKQhUrvvePECrY', tamil: 'https://youtube.com/playlist?list=PL1lPSVzW89HZSU-2nTJm47pt8GveJBjAE', practice: 'https://www.indiabix.com/aptitude/average/' },
    { id: '10', title: 'Ratios & Proportion', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvsF0UHkJSfc5MGqCrs-28K_', tamil: 'https://youtube.com/playlist?list=PL1lPSVzW89HaJxwWQwPOanJlAVj2b_W8h', practice: 'https://www.indiabix.com/aptitude/ratio-and-proportion/' },
    { id: '11', title: 'Mixtures & Alligation', english: 'https://youtube.com/playlist?list=PLeEM8xOubEBIPaTwpnUt9ndl0DYJFN1u1', tamil: 'https://youtube.com/playlist?list=PLeEM8xOubEBIPaTwpnUt9ndl0DYJFN1u1', practice: 'https://www.indiabix.com/aptitude/mixture-and-alligation/' },
    { id: '12', title: 'Probability', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvvw5bIV77qibe73XfdsM2lP', tamil: 'https://youtube.com/playlist?list=PL1lPSVzW89Hao59JXdgQTEoRPkJhXFcQQ', practice: 'https://www.indiabix.com/aptitude/probability/' },
    { id: '13', title: 'Permutation & Combination', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvvfdX4oS3hWDWSMHaZ1x0HW', tamil: 'https://youtube.com/playlist?list=PL1lPSVzW89HbCMNZotVw9IkwaWb5yckli', practice: 'https://www.indiabix.com/aptitude/permutation-and-combination/' },
    { id: '14', title: 'Number System', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvvLxig0poIGPWnGF74R4uxq', tamil: 'https://youtube.com/playlist?list=PL1lPSVzW89HZwXdLa2ghwSpyR2nnlzSPh', practice: 'https://www.indiabix.com/aptitude/number-system/' },
    { id: '15', title: 'HCF & LCM', english: 'https://youtube.com/playlist?list=PLOoogDtEDyvtaSyMUX9IyTgyDc80QW9IT', tamil: 'https://youtube.com/playlist?list=PL1lPSVzW89HZUIV_DTXKNldP3BKNlaEkO', practice: 'https://www.indiabix.com/aptitude/problems-on-hcf-and-lcm/' },
    { id: '16', title: 'Simplification & Approximation', english: 'https://youtu.be/5rZBdmYZdpo', tamil: 'https://youtu.be/Ahc7PhLObJI', practice: 'https://www.indiabix.com/aptitude/simplification/' }
];

const logicalTopics: Topic[] = [
    { id: '1', title: 'Number Series', practice: 'https://www.indiabix.com/logical-reasoning/number-series/' },
    { id: '2', title: 'Verbal Classification', practice: 'https://www.indiabix.com/logical-reasoning/verbal-classification/' },
    { id: '3', title: 'Analogies', practice: 'https://www.indiabix.com/logical-reasoning/analogies/' },
    { id: '4', title: 'Matching Definitions', practice: 'https://www.indiabix.com/logical-reasoning/matching-definitions/' },
    { id: '5', title: 'Verbal Reasoning', practice: 'https://www.indiabix.com/logical-reasoning/verbal-reasoning/' },
    { id: '6', title: 'Logical Games', practice: 'https://www.indiabix.com/logical-reasoning/logical-games/' },
    { id: '7', title: 'Statement and Assumption', practice: 'https://www.indiabix.com/logical-reasoning/statement-and-assumption/' },
    { id: '8', title: 'Statement and Conclusion', practice: 'https://www.indiabix.com/logical-reasoning/statement-and-conclusion/' },
    { id: '9', title: 'Cause and Effect', practice: 'https://www.indiabix.com/logical-reasoning/cause-and-effect/' },
    { id: '10', title: 'Logical Deduction', practice: 'https://www.indiabix.com/logical-reasoning/logical-deduction/' },
    { id: '11', title: 'Letter and Symbol Series', practice: 'https://www.indiabix.com/logical-reasoning/letter-and-symbol-series/' },
    { id: '12', title: 'Essential Part', practice: 'https://www.indiabix.com/logical-reasoning/essential-part/' },
    { id: '13', title: 'Artificial Language', practice: 'https://www.indiabix.com/logical-reasoning/artificial-language/' },
    { id: '14', title: 'Making Judgments', practice: 'https://www.indiabix.com/logical-reasoning/making-judgments/' },
    { id: '15', title: 'Logical Problems', practice: 'https://www.indiabix.com/logical-reasoning/logical-problems/' },
    { id: '16', title: 'Analyzing Arguments', practice: 'https://www.indiabix.com/logical-reasoning/analyzing-arguments/' },
    { id: '17', title: 'Course of Action', practice: 'https://www.indiabix.com/logical-reasoning/course-of-action/' },
    { id: '18', title: 'Theme Detection', practice: 'https://www.indiabix.com/logical-reasoning/theme-detection/' },
    { id: '19', title: 'Statement and Argument', practice: 'https://www.indiabix.com/logical-reasoning/statement-and-argument/' }
];

const verbalTopics: Topic[] = [
    { id: '1', title: 'Spotting Errors', practice: 'https://www.indiabix.com/verbal-ability/spotting-errors/' },
    { id: '2', title: 'Antonyms', practice: 'https://www.indiabix.com/verbal-ability/antonyms/' },
    { id: '3', title: 'Spellings', practice: 'https://www.indiabix.com/verbal-ability/spellings/' },
    { id: '4', title: 'Ordering of Words', practice: 'https://www.indiabix.com/verbal-ability/ordering-of-words/' },
    { id: '5', title: 'Sentence Improvement', practice: 'https://www.indiabix.com/verbal-ability/sentence-improvement/' },
    { id: '6', title: 'Ordering of Sentences', practice: 'https://www.indiabix.com/verbal-ability/ordering-of-sentences/' },
    { id: '7', title: 'Cloze Test', practice: 'https://www.indiabix.com/verbal-ability/cloze-test/' },
    { id: '8', title: 'One Word Substitutes', practice: 'https://www.indiabix.com/verbal-ability/one-word-substitutes/' },
    { id: '9', title: 'Change of Voice', practice: 'https://www.indiabix.com/verbal-ability/change-of-voice/' },
    { id: '10', title: 'Verbal Analogies', practice: 'https://www.indiabix.com/verbal-ability/verbal-analogies/' },
    { id: '11', title: 'Synonyms', practice: 'https://www.indiabix.com/verbal-ability/synonyms/' },
    { id: '12', title: 'Selecting Words', practice: 'https://www.indiabix.com/verbal-ability/selecting-words/' },
    { id: '13', title: 'Sentence Formation', practice: 'https://www.indiabix.com/verbal-ability/sentence-formation/' },
    { id: '14', title: 'Sentence Correction', practice: 'https://www.indiabix.com/verbal-ability/sentence-correction/' },
    { id: '15', title: 'Completing Statements', practice: 'https://www.indiabix.com/verbal-ability/completing-statements/' },
    { id: '16', title: 'Paragraph Formation', practice: 'https://www.indiabix.com/verbal-ability/paragraph-formation/' },
    { id: '17', title: 'Comprehension', practice: 'https://www.indiabix.com/verbal-ability/comprehension/' },
    { id: '18', title: 'Idioms and Phrases', practice: 'https://www.indiabix.com/verbal-ability/idioms-and-phrases/' },
    { id: '19', title: 'Change of Speech', practice: 'https://www.indiabix.com/verbal-ability/change-of-speech/' }
];

interface TechnicalTopic {
    id: string;
    title: string;
    english: string;
    tamil: string;
    practice: string;
    subtitle: string;
    icon: React.ReactNode;
    colorClass: string;
}

const technicalTopics: TechnicalTopic[] = [
    {
        id: '1', title: 'C Programming', subtitle: 'Pointers, Arrays, Memory',
        english: 'https://www.youtube.com/watch?v=KJgsSFOSQv0',
        tamil: 'https://www.youtube.com/watch?v=Zi_n_mE3pEM',
        practice: 'https://www.indiabix.com/c-programming/questions-and-answers/',
        icon: <Terminal className="w-7 h-7 text-slate-600" />,
        colorClass: 'bg-slate-100 group-hover:bg-slate-200'
    },
    {
        id: '2', title: 'Java Programming', subtitle: 'OOPs, Collections, Strings',
        english: 'https://www.youtube.com/playlist?list=PLsyeobzWxl7pe_IiTfN68UlrFJ97TawYs',
        tamil: 'https://www.youtube.com/watch?v=Gex-j7GlCHc',
        practice: 'https://www.indiabix.com/java/questions-and-answers/',
        icon: <Code2 className="w-7 h-7 text-red-600" />,
        colorClass: 'bg-red-50 group-hover:bg-red-100'
    },
    {
        id: '3', title: 'Python Programming', subtitle: 'Basics, Lists, Libraries',
        english: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
        tamil: 'https://www.youtube.com/watch?v=dHzYLjfr-uY',
        practice: 'https://www.indiabix.com/python-programming/questions-and-answers/',
        icon: <Database className="w-7 h-7 text-yellow-600" />,
        colorClass: 'bg-yellow-50 group-hover:bg-yellow-100'
    },
    {
        id: '4', title: 'Data Structures', subtitle: 'Trees, Graphs, Stacks',
        english: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZgh8NY68Gq8qK1uP63uW5',
        tamil: 'https://www.youtube.com/watch?v=IBkwl4HSY8A',
        practice: 'https://www.indiabix.com/data-structure/questions-and-answers/',
        icon: <Layers className="w-7 h-7 text-orange-600" />,
        colorClass: 'bg-orange-50 group-hover:bg-orange-100'
    },
    {
        id: '5', title: 'Algorithms', subtitle: 'Sorting, Searching, DP',
        english: 'https://www.youtube.com/playlist?list=PL2_aWCzGMAwLz3gquqoyeJJOYfTLEpEkj',
        tamil: 'https://www.youtube.com/playlist?list=PLj8W76VvK5WntE6Q7YmR0K3MTo3n0S69v',
        practice: 'https://www.indiabix.com/algorithms/questions-and-answers/',
        icon: <BrainCircuit className="w-7 h-7 text-pink-600" />,
        colorClass: 'bg-pink-50 group-hover:bg-pink-100'
    },
    {
        id: '6', title: 'DBMS', subtitle: 'Normalization, SQL, ACID',
        english: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y',
        tamil: 'https://www.youtube.com/watch?v=lf2lZLNUoek',
        practice: 'https://www.indiabix.com/database/questions-and-answers/',
        icon: <Database className="w-7 h-7 text-cyan-600" />,
        colorClass: 'bg-cyan-50 group-hover:bg-cyan-100'
    },
    {
        id: '7', title: 'Operating System', subtitle: 'Process, Memory, Threads',
        english: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLSiER_qRvm649Si',
        tamil: 'https://www.youtube.com/playlist?list=PL7jN_L-p_vW0B_C9O689-F_5M43mU4G6p',
        practice: 'https://www.indiabix.com/operating-system/questions-and-answers/',
        icon: <Cpu className="w-7 h-7 text-indigo-600" />,
        colorClass: 'bg-indigo-50 group-hover:bg-indigo-100'
    },
    {
        id: '8', title: 'Computer Networks', subtitle: 'OSI Model, TCP/IP, DNS',
        english: 'https://www.youtube.com/watch?v=IPvYjXWgi6U',
        tamil: 'https://www.youtube.com/playlist?list=PL7jN_L-p_vW0B888f4B0-H-mRz6A_G5S',
        practice: 'https://www.indiabix.com/networking/questions-and-answers/',
        icon: <Network className="w-7 h-7 text-sky-600" />,
        colorClass: 'bg-sky-50 group-hover:bg-sky-100'
    },
    {
        id: '9', title: 'Git & GitHub', subtitle: 'Version Control',
        english: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
        tamil: 'https://www.youtube.com/watch?v=tNwrtU_Adag',
        practice: 'https://www.indiabix.com/git/questions-and-answers/',
        icon: <GitBranch className="w-7 h-7 text-emerald-600" />,
        colorClass: 'bg-emerald-50 group-hover:bg-emerald-100'
    },
    {
        id: '10', title: 'Web Basics', subtitle: 'HTML, CSS, JS',
        english: 'https://www.youtube.com/watch?v=G3e-cpL7ofc',
        tamil: 'https://www.youtube.com/playlist?list=PLjVLYmrlmjGfHlD85t8j_XfB_K697YvE1',
        practice: 'https://www.indiabix.com/web-technology/questions-and-answers/',
        icon: <Globe className="w-7 h-7 text-violet-600" />,
        colorClass: 'bg-violet-50 group-hover:bg-violet-100'
    }
];

interface CategoryCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    colorClass: string;
    onClick?: () => void;
    hasVideo?: boolean;
    hideActions?: boolean;
    englishLink?: string;
    tamilLink?: string;
    practiceLink?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    title, subtitle, icon, colorClass, onClick, hasVideo, hideActions,
    englishLink, tamilLink, practiceLink
}) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group" onClick={onClick}>
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors", colorClass)}>
            {icon}
        </div>

        <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
        <p className="text-sm text-slate-400 mb-6 font-medium">{subtitle}</p>

        {!hideActions && hasVideo && (englishLink || tamilLink) && (
            <div className="flex gap-3 mb-4">
                {englishLink && (
                    <a
                        href={englishLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-red-100 transition-colors"
                    >
                        <Youtube className="w-3.5 h-3.5" />
                        English
                    </a>
                )}
                {tamilLink && (
                    <a
                        href={tamilLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-red-100 transition-colors"
                    >
                        <Youtube className="w-3.5 h-3.5" />
                        Tamil
                    </a>
                )}
            </div>
        )}

        {!hideActions && practiceLink && (
            <a
                href={practiceLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full py-3 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors"
            >
                <Globe className="w-4 h-4" />
                Practice on IndiaBIX
            </a>
        )}
    </div>
);

const SubTopicCard: React.FC<Topic & { category: string }> = (topic) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all duration-300 group">
        <div className="flex flex-col h-full">
            <h3 className="font-bold text-slate-800 mb-4 text-base border-b border-slate-100 pb-2 flex items-center justify-between">
                {topic.title}
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
            </h3>

            <div className="space-y-3 mt-auto">
                {topic.category === 'Quant' && topic.english && (
                    <div className="grid grid-cols-2 gap-2">
                        <a
                            href={topic.english}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                            <Youtube className="w-3.5 h-3.5" />
                            English
                        </a>
                        <a
                            href={topic.tamil}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                            <Youtube className="w-3.5 h-3.5" />
                            Tamil
                        </a>
                    </div>
                )}

                <a
                    href={topic.practice}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-brand-50 hover:text-brand-700 border border-slate-100 hover:border-brand-200 transition-all"
                >
                    <Globe className="w-3.5 h-3.5" />
                    {topic.category === 'Verbal' ? 'Start Practice' : 'Solve Problems'}
                </a>
            </div>
        </div>
    </div>
);

export const StudentLearning: React.FC = () => {
    const [view, setView] = useState<'home' | 'details'>('home');
    const [selectedCategory, setSelectedCategory] = useState<'Quant' | 'Logical' | 'Verbal'>('Quant');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCategoryClick = (cat: 'Quant' | 'Logical' | 'Verbal') => {
        setSelectedCategory(cat);
        setSearchQuery('');
        setView('details');
    };

    const getTopics = () => {
        switch (selectedCategory) {
            case 'Quant': return quantTopics;
            case 'Logical': return logicalTopics;
            case 'Verbal': return verbalTopics;
            default: return quantTopics;
        }
    };

    const getCategoryDetails = () => {
        switch (selectedCategory) {
            case 'Quant': return { title: 'Quantitative Aptitude', sub: 'Time, Distance, Profit, Probability' };
            case 'Logical': return { title: 'Logical Reasoning', sub: 'Puzzles, Coding, Relations' };
            case 'Verbal': return { title: 'Verbal Ability', sub: 'Grammar, RC, Vocabulary' };
        }
    }

    if (view === 'details') {
        const details = getCategoryDetails();
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView('home')}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{details.title}</h1>
                        <p className="text-slate-500">{details.sub}</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder={`Search ${details.title}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getTopics().filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((topic) => (
                        <div key={topic.id} >
                            <SubTopicCard {...topic} category={selectedCategory} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <PageHeader
                title="Learning Resources"
                description="Master placement topics with curated video tutorials in Tamil & English."
            />

            {/* Aptitude Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <BrainCircuit className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Aptitude & Reasoning</h2>
                        <p className="text-xs text-slate-500 font-medium">Essential for first round elimination</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CategoryCard
                        title="Quantitative Aptitude"
                        subtitle="Time, Distance, Profit, Probability"
                        icon={<Sigma className="w-7 h-7 text-blue-600" />}
                        colorClass="bg-blue-50 group-hover:bg-blue-100"
                        onClick={() => handleCategoryClick('Quant')}
                        hideActions={true}
                    />
                    <CategoryCard
                        title="Logical Reasoning"
                        subtitle="Puzzles, Coding, Relations"
                        icon={<BrainCircuit className="w-7 h-7 text-purple-600" />}
                        colorClass="bg-purple-50 group-hover:bg-purple-100"
                        onClick={() => handleCategoryClick('Logical')}
                        hideActions={true}
                    />
                    <CategoryCard
                        title="Verbal Ability"
                        subtitle="Grammar, RC, Vocabulary"
                        icon={<MessageSquareQuote className="w-7 h-7 text-emerald-600" />}
                        colorClass="bg-emerald-50 group-hover:bg-emerald-100"
                        onClick={() => handleCategoryClick('Verbal')}
                        hideActions={true}
                    />
                </div>
            </div>

            {/* Technical Core Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Terminal className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Technical Core</h2>
                        <p className="text-xs text-slate-500 font-medium">Programming, CS Fundamentals & Tools</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {technicalTopics.map((topic) => (
                        <CategoryCard
                            key={topic.id}
                            title={topic.title}
                            subtitle={topic.subtitle}
                            icon={topic.icon}
                            colorClass={topic.colorClass}
                            englishLink={topic.english}
                            tamilLink={topic.tamil}
                            practiceLink={topic.practice}
                            hasVideo={true}
                        />
                    ))}
                </div>
            </div>

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
