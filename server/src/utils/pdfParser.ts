const pdf = require('pdf-parse');

interface Testcase {
    input: string;
    output: string;
    public: boolean;
}

interface ExtractedQuestion {
    type: 'MCQ' | 'CODING';
    question_text: string;
    options?: string[];
    correct_answer?: string;
    marks: number;
    explanation?: string;
    // Coding specific
    input_format?: string;
    output_format?: string;
    constraints?: string;
    testcases?: Testcase[];
}

interface AssessmentMetadata {
    title: string;
    startTime: string; // ISO
    endTime: string; // ISO
    duration: number;
    questions: ExtractedQuestion[];
}

export const parseAssessmentPdf = async (buffer: Buffer): Promise<AssessmentMetadata> => {
    let text = "";
    try {
        const data = await pdf(buffer);
        text = data.text.replace(/\r/g, '').trim();
    } catch (e: any) {
        console.error("PDF Parse Error Stack:", e);
        throw new Error(`PDF Parsing Crashed: ${e.message} \nStack: ${e.stack}`);
    }

    return parseAssessmentText(text);
};

export const parseAssessmentText = (text: string): AssessmentMetadata => {
    // Debug: Log first 500 chars to help user debug empty/garbled PDF reads
    // This will appear in the 500 error message if parsing fails early
    const textSnippet = text.substring(0, 500).replace(/\n/g, '\\n');

    // --- 1. SEPARATE SECTIONS ---
    // Relaxed Regex: Matches "=========" (at least 5) then Name then "========="
    const sections: { type: string, content: string }[] = [];

    // Pattern to split by logic:
    // Captures: ( ====== HEADER ====== )
    const headerPattern = /(={5,}\s*(?:EXAM|MCQ|CODING)\s*={5,})/gi;
    const splitParts = text.split(headerPattern);

    for (let i = 1; i < splitParts.length; i += 2) {
        const header = splitParts[i].toUpperCase();
        const content = splitParts[i + 1] ? splitParts[i + 1].trim() : "";

        if (header.includes("EXAM")) sections.push({ type: 'EXAM', content });
        else if (header.includes("MCQ")) sections.push({ type: 'MCQ', content });
        else if (header.includes("CODING")) sections.push({ type: 'CODING', content });
    }

    if (sections.length === 0) {
        throw new Error(`No sections found. Parser saw text start: "${textSnippet}..." \nPlease ensure sections like '====== EXAM ======' exist.`);
    }

    // --- 2. PARSE EXAM METADATA ---
    const examSection = sections.find(s => s.type === 'EXAM');
    if (!examSection) throw new Error("Missing 'EXAM' section.");

    const examLines = examSection.content;
    // Relaxed matches: Case insensitive, optional spaces around colon
    const titleMatch = examLines.match(/Title\s*:\s*(.+)/i);
    // Date match: Capture the whole string after Start:/End: to parse manually
    const startMatch = examLines.match(/Start\s*:\s*(.+)/i);
    const endMatch = examLines.match(/End\s*:\s*(.+)/i);
    const durationMatch = examLines.match(/Duration\s*:\s*(\d+)/i);

    if (!titleMatch) throw new Error("Exam Section: Missing 'Title: <text>'");
    if (!startMatch) throw new Error("Exam Section: Missing 'Start: DD-MM-YYYY HH:mm'");
    if (!endMatch) throw new Error("Exam Section: Missing 'End: DD-MM-YYYY HH:mm'");
    if (!durationMatch) throw new Error("Exam Section: Missing 'Duration: <minutes>'");

    const title = titleMatch[1].trim();
    const startTime = parseDateTime(startMatch[1]);
    const endTime = parseDateTime(endMatch[1]);
    const duration = parseInt(durationMatch[1]);

    if (isNaN(duration)) throw new Error("Exam Section: Duration must be a valid number.");

    // --- 3. PARSE QUESTIONS ---
    const questions: ExtractedQuestion[] = [];

    for (const section of sections) {
        try {
            if (section.type === 'MCQ') {
                questions.push(parseMCQ(section.content));
            } else if (section.type === 'CODING') {
                questions.push(parseCoding(section.content));
            }
        } catch (err: any) {
            console.warn(`Skipping malformed question in ${section.type} section:`, err.message);
            // Throwing context-aware error
            throw new Error(`Error in ${section.type} Section:\n${err.message}`);
        }
    }

    if (questions.length === 0) throw new Error("No valid Questions found. Add 'MCQ' or 'CODING' sections.");

    return {
        title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        questions
    };
};

function parseDateTime(dateStr: string): Date {
    // Supports:
    // DD-MM-YYYY HH:mm
    // DD/MM/YYYY HH:mm
    // YYYY-MM-DD HH:mm

    const cleaned = dateStr.trim();

    // Try standard JS Date first for ISO-like strings
    let date = new Date(cleaned);
    if (!isNaN(date.getTime())) return date;

    // Custom Parse for DD-MM-YYYY or DD/MM/YYYY
    // Regex to split date and time
    // Matches: D(D)-M(M)-YYYY(YY) (sep: - or /) space H(H):m(m)
    const match = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})\s+(\d{1,2}):(\d{2})$/);

    if (match) {
        const [_, d, m, y, h, min] = match;
        date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min));
        if (!isNaN(date.getTime())) return date;
    }

    throw new Error(`Invalid Date Format: '${cleaned}'. Expected 'DD-MM-YYYY HH:mm' or 'YYYY-MM-DD HH:mm'`);
}

function parseMCQ(content: string): ExtractedQuestion {
    // Relaxed Regex
    const questionMatch = content.match(/Question\s*:\s*([\s\S]*?)(?=\n\s*Options\s*:)/i);
    const optionsMatch = content.match(/Options\s*:\s*([\s\S]*?)(?=\n\s*Answer\s*:)/i);
    const answerMatch = content.match(/Answer\s*:\s*([A-D])(?=\n\s*Explanation\s*:| \n|$)/i);
    const explanationMatch = content.match(/Explanation\s*:\s*([\s\S]*)/i);

    if (!questionMatch) throw new Error("MCQ: Missing 'Question:' field.");
    if (!optionsMatch) throw new Error("MCQ: Missing 'Options:' field.");
    if (!answerMatch) throw new Error("MCQ: Missing 'Answer:' or invalid format (A|B|C|D).");

    const question_text = questionMatch[1].trim();
    const correct_answer = answerMatch[1].trim().toUpperCase();
    const explanation = explanationMatch ? explanationMatch[1].trim() : undefined;

    // Parse options
    const optionsRaw = optionsMatch[1].trim();
    const options: string[] = [];

    // Regex for "A. text" "A) text" or just lines if not detected
    // We look for A. / B. / C. / D.
    const optsMatches = Array.from(optionsRaw.matchAll(/([A-D])[\.\)]\s+([\s\S]+?)(?=(?:\n[A-D][\.\)])|$)/gi));

    if (optsMatches.length === 4) {
        // Trust the capture order from the regex
        optsMatches.forEach(m => options.push(m[2].trim()));
    } else {
        throw new Error(`MCQ: Found ${optsMatches.length} options. Required 4 options starting with A., B., C., D.`);
    }

    // Map Correct Answer "A" -> Option Value
    const answerIndex = "ABCD".indexOf(correct_answer);
    if (answerIndex === -1) throw new Error(`MCQ: Invalid Answer '${correct_answer}'. Must be A, B, C, or D.`);
    if (answerIndex >= options.length) throw new Error(`MCQ: Answer is '${correct_answer}' but option not found.`);

    const actualCorrectAnswer = options[answerIndex];

    return {
        type: 'MCQ',
        question_text,
        options,
        correct_answer: actualCorrectAnswer,
        marks: 1,
        explanation
    };
}

function parseCoding(content: string): ExtractedQuestion {
    // Relaxed keys
    const qMatch = content.match(/Question\s*:\s*([\s\S]*?)(?=\n\s*Marks\s*:)/i);
    const mMatch = content.match(/Marks\s*:\s*(\d+)/i);
    const iMatch = content.match(/Input Format\s*:\s*([\s\S]*?)(?=\n\s*Output Format\s*:)/i);
    const oMatch = content.match(/Output Format\s*:\s*([\s\S]*?)(?=\n\s*Constraints\s*:)/i);
    const cMatch = content.match(/Constraints\s*:\s*([\s\S]*?)(?=\n\s*Testcases\s*:)/i);
    const tMatch = content.match(/Testcases\s*:\s*([\s\S]*?)(?=\n\s*Explanation\s*:|$)/i);
    const expMatch = content.match(/Explanation\s*:\s*([\s\S]*)/i);

    if (!qMatch) throw new Error("CODING: Missing 'Question:'");
    if (!mMatch) throw new Error("CODING: Missing 'Marks:'");
    if (!iMatch) throw new Error("CODING: Missing 'Input Format:'");
    const testcasesRaw = tMatch ? tMatch[1].trim() : "";

    const question_text = qMatch[1].trim();
    const marks = parseInt(mMatch[1]);

    if (!oMatch) throw new Error("CODING: Missing 'Output Format:'");
    if (!cMatch) throw new Error("CODING: Missing 'Constraints:'");
    if (!tMatch) throw new Error("CODING: Missing 'Testcases:'");

    const input_format = iMatch[1].trim();
    const output_format = oMatch[1].trim();
    const constraints = cMatch[1].trim();
    const explanation = expMatch ? expMatch[1].trim() : undefined;

    // Parse Testcases
    const testcases: Testcase[] = [];

    // Split key Input:
    const inputSplits = testcasesRaw.split(/Input\s*:\s*/i).filter(t => t.trim());

    for (const block of inputSplits) {
        // Output: ... Public: ...

        // If "Output:" exists explicitly
        const outputSplit = block.split(/Output\s*:\s*/i);

        let inputVal = "";
        let outputVal = "";
        let isPublic = false;

        if (outputSplit.length === 2) {
            inputVal = outputSplit[0].trim();
            const rest = outputSplit[1];
            const pubMatch = rest.match(/([\s\S]*?)\n\s*Public\s*:\s*(true|false)/i);
            if (pubMatch) {
                outputVal = pubMatch[1].trim();
                isPublic = pubMatch[2].toLowerCase() === 'true';
            } else {
                continue;
            }
        } else {
            continue;
        }

        testcases.push({
            input: inputVal,
            output: outputVal,
            public: isPublic
        });
    }

    if (testcases.length === 0) throw new Error("CODING: No valid testcases found. Format: 'Input: ... Output: ... Public: true'");

    return {
        type: 'CODING',
        question_text,
        marks,
        input_format,
        output_format,
        constraints,
        testcases,
        explanation
    };
}
