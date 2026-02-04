const pdf = require('pdf-parse');

interface ExtractedQuestion {
    question_text: string;
    options: string[];
    correct_answer: string;
    explanation: string;
}

export const parseAssessmentPdf = async (buffer: Buffer) => {
    try {
        const data = await pdf(buffer);
        const text: string = data.text;

        // 1. Basic Metadata Extraction
        const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l);

        let title = 'Extracted Assessment';
        if (lines.length > 0) {
            // Heuristic: If first line is generic template header, avoid using it as specific title
            if (lines[0].toLowerCase().includes('placementprepro') || lines[0].toLowerCase().includes('college')) {
                title = 'Weekly Assessment';
            } else {
                title = lines[0];
            }
        }

        // Duration detection (Time: 60 mins / Duration: 90 minutes)
        let duration = 60;
        const timeMatch = text.match(/(?:Time|Duration|Allocated Time)\s*[:\-]?\s*(\d+)\s*(?:min|mins|minutes)?/i);
        if (timeMatch) duration = parseInt(timeMatch[1]);

        // 2. Question Extraction
        // Supports: Numbered "1. ", "Q1. " OR Label "Question:"
        const questions: ExtractedQuestion[] = [];

        // Split text based on question delimiters
        // The regex looks for lookahead of Newline + (Number + Dot/Paren) OR (Question:)
        const questionBlocks = text.split(/(?=\n(?:Q\d+|\d+)[.)]|\nQuestion:)/i);

        for (const block of questionBlocks) {
            const lines = block.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
            if (lines.length === 0) continue;

            const qLine = lines[0];
            let question_text = '';
            let startIdx = 1;

            // Type A: "Question:" Label
            if (qLine.match(/^Question:/i)) {
                const match = qLine.match(/^Question:\s*(.+)/i);
                if (match) {
                    question_text = match[1];
                }
                // If text was not on the same line, loop below will pick it up
            }
            // Type B: Numbered "1. Text"
            else if (qLine.match(/^(?:Q\d+|\d+)[.)]/)) {
                const match = qLine.match(/^(?:Q\d+|\d+)[.)]\s*(.+)/);
                if (match) question_text = match[1];
            } else {
                continue; // Not a start of question
            }

            const options: string[] = [];
            let correct_answer = '';
            let explanation = '';
            let tempAnswerIndex = -1;

            for (let i = startIdx; i < lines.length; i++) {
                const line = lines[i];

                // Option (A) ... / A. ...)
                const optMatch = line.match(/^[A-D][.)]\s*(.+)/);
                if (optMatch) {
                    options.push(optMatch[1]);
                    continue;
                }

                // Correct Answer (Correct Answer: B)
                const ansMatch = line.match(/^Correct Answer:\s*([A-D])/i);
                if (ansMatch) {
                    tempAnswerIndex = ansMatch[1].toUpperCase().charCodeAt(0) - 65;
                    continue;
                }

                // Explanation
                const expMatch = line.match(/^Explanation(?:\s*\(Optional\))?:\s*(.*)/i);
                if (expMatch) {
                    explanation = expMatch[1];
                    continue;
                }

                // If explanation started, append line
                if (explanation && !optMatch && !ansMatch) {
                    explanation += " " + line;
                    continue;
                }

                // Capture Question Text if empty (Template case) or multiline
                if (options.length === 0 && tempAnswerIndex === -1 && !explanation) {
                    // Avoid capturing empty lines explicitly filtered out, but check logic
                    // If question_text is empty, set it. If not, append.
                    if (!question_text) question_text = line;
                    else question_text += " " + line;
                }
            }

            // Resolve Correct Answer
            if (tempAnswerIndex >= 0 && options[tempAnswerIndex]) {
                correct_answer = options[tempAnswerIndex];
            }

            if (question_text && options.length >= 2) {
                questions.push({
                    question_text,
                    options,
                    correct_answer,
                    explanation
                });
            }
        }

        return { title, duration, questions };
    } catch (error) {
        console.error("PDF Parse Error", error);
        throw new Error("Failed to parse PDF content");
    }
};
