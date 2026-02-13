import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorPanelProps {
    language: string;
    code: string;
    onChange: (value: string | undefined) => void;
    theme?: string;
}

const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({ language, code, onChange, theme = 'vs-dark' }) => {

    // Prevent context menu (Right click)
    const handleEditorDidMount = (editor: any) => {
        editor.onContextMenu((e: any) => {
            e.event.preventDefault();
        });
    };

    return (
        <div className="h-full w-full border border-slate-700 rounded-lg overflow-hidden shadow-lg bg-[#1e1e1e] select-text">
            {/* Header: Language Tag */}
            <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-slate-700">
                <span className="text-xs font-mono text-slate-400 uppercase">{language}</span>
                <span className="text-xs text-slate-500">Auto-saved</span>
            </div>

            <div className="h-[500px] w-full" onContextMenu={(e) => e.preventDefault()}>
                <Editor
                    height="100%"
                    defaultLanguage={language}
                    language={language}
                    value={code}
                    theme={theme}
                    onChange={onChange}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        contextmenu: false, // Internal Monaco context menu
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        padding: { top: 16 }
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditorPanel;
