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
        // Return dirty error details for debugging
        throw new Error(`PDF Parsing Crashed: ${e.message} \nStack: ${e.stack}`);
    }

    // --- 1. SEPARATE SECTIONS ---
    // User defined strictly:
    // EXAM:   ================ EXAM =================   (16 =, 17 =)
    // MCQ:    ================ MCQ ==================   (16 =, 18 =)
    // CODING: ================ CODING ===============   (16 =, 15 =)

    // We use a regex that matches these strictly but captures the content between them.
    const sections: { type: string, content: string }[] = [];

    const headerPattern = /(={16} (?:EXAM|MCQ|CODING) ={15,18})/g;
    const splitParts = text.split(headerPattern);

    // splitParts will be [pre-text, header1, content1, header2, content2, ...]
    // We iterate start from 1 (header1)

    for (let i = 1; i < splitParts.length; i += 2) {
        const header = splitParts[i];
        const content = splitParts[i + 1] ? splitParts[i + 1].trim() : "";

        if (header.includes("EXAM")) sections.push({ type: 'EXAM', content });
        else if (header.includes("MCQ")) sections.push({ type: 'MCQ', content });
        else if (header.includes("CODING")) sections.push({ type: 'CODING', content });
    }

    // --- 2. PARSE EXAM METADATA ---
    const examSection = sections.find(s => s.type === 'EXAM');
    if (!examSection) throw new Error("Missing '================ EXAM =================' section.");

    const examLines = examSection.content;
    const titleMatch = examLines.match(/Title:\s*(.+)/);
    const startMatch = examLines.match(/Start:\s*(\d{2}-\d{2}-\d{4} \d{2}:\d{2})/);
    const endMatch = examLines.match(/End:\s*(\d{2}-\d{2}-\d{4} \d{2}:\d{2})/);
    const durationMatch = examLines.match(/Duration:\s*(\d+)/);

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
        if (section.type === 'MCQ') {
            questions.push(parseMCQ(section.content));
        } else if (section.type === 'CODING') {
            questions.push(parseCoding(section.content));
        }
    }

    if (questions.length === 0) throw new Error("No Questions Found. Add 'MCQ' or 'CODING' sections.");

    return {
        title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        questions
    };
};

function parseDateTime(dateStr: string): Date {
    // Format: DD-MM-YYYY HH:mm
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    const date = new Date(year, month - 1, day, hours, minutes);
    if (isNaN(date.getTime())) throw new Error(`Invalid Date Format: ${dateStr}`);
    return date;
}

function parseMCQ(content: string): ExtractedQuestion {
    // Content structure:
    // Question: ...
    // Options: ...
    // Answer: ...
    // Explanation: ...

    const questionMatch = content.match(/Question:\s*([\s\S]*?)(?=\nOptions:)/i);
    const optionsMatch = content.match(/Options:\s*([\s\S]*?)(?=\nAnswer:)/i);
    const answerMatch = content.match(/Answer:\s*([A-D])(?=\nExplanation:| \n|$)/i); // Stop at Explanation or end
    const explanationMatch = content.match(/Explanation:\s*([\s\S]*)/i);

    if (!questionMatch) throw new Error("MCQ: Missing 'Question:' field.");
    if (!optionsMatch) throw new Error("MCQ: Missing 'Options:' field.");
    if (!answerMatch) throw new Error("MCQ: Missing 'Answer:' or invalid format (A|B|C|D).");

    const question_text = questionMatch[1].trim();
    const correct_answer = answerMatch[1].trim();
    const explanation = explanationMatch ? explanationMatch[1].trim() : undefined;

    // Parse options
    const optionsRaw = optionsMatch[1].trim();
    const options: string[] = [];
    const optionLines = optionsRaw.split('\n');
    let currentOption = "";

    // Simple parser for "A. text"
    // We expect exactly 4 options A, B, C, D
    const optRegex = /^([A-D])\.\s*(.+)/;

    // We can also just regex matches from the block
    const optsMatches = Array.from(optionsRaw.matchAll(/([A-D])\.\s+([\s\S]+?)(?=(?:\n[A-D]\.)|$)/g));

    if (optsMatches.length !== 4) {
        throw new Error(`MCQ: Found ${optsMatches.length} options. Strict format requires exactly 4 options (A., B., C., D.).`);
    }

    // Map A->0, B->1 etc to ensure order? 
    // The previous system used an array of strings. 
    // Let's iterate and push ONLY the text.
    // Assuming A, B, C, D in order.
    optsMatches.forEach(m => options.push(m[2].trim()));

    // Map Correct Answer "A" -> Option Value
    const answerIndex = "ABCD".indexOf(correct_answer);
    if (answerIndex === -1) throw new Error(`MCQ: Invalid Answer '${correct_answer}'. Must be A, B, C, or D.`);

    const actualCorrectAnswer = options[answerIndex];

    return {
        type: 'MCQ',
        question_text,
        options,
        correct_answer: actualCorrectAnswer,
        marks: 1, // Default marks for MCQ
        explanation
    };
}

function parseCoding(content: string): ExtractedQuestion {
    // Structure:
    // Question: ...
    // Marks: ...
    // Input Format: ...
    // Output Format: ...
    // Constraints: ...
    // Testcases: ...

    const qMatch = content.match(/Question:\s*([\s\S]*?)(?=\nMarks:)/i);
    const mMatch = content.match(/Marks:\s*(\d+)/i);
    const iMatch = content.match(/Input Format:\s*([\s\S]*?)(?=\nOutput Format:)/i);
    const oMatch = content.match(/Output Format:\s*([\s\S]*?)(?=\nConstraints:)/i);
    const cMatch = content.match(/Constraints:\s*([\s\S]*?)(?=\nTestcases:)/i);
    const tMatch = content.match(/Testcases:\s*([\s\S]*?)(?=\nExplanation:|$)/i); // Optional explanation at end? Format didn't specify explanation for Coding but good to have.
    // Re-reading user format for Coding:
    // ... Testcases: \n Input: ... Output: ... Public: ... \n Explanation: <optional>
    const expMatch = content.match(/Explanation:\s*([\s\S]*)/i);

    if (!qMatch) throw new Error("CODING: Missing 'Question:'");
    if (!mMatch) throw new Error("CODING: Missing 'Marks:'");
    if (!iMatch) throw new Error("CODING: Missing 'Input Format:'");
    if (!oMatch) throw new Error("CODING: Missing 'Output Format:'");
    if (!cMatch) throw new Error("CODING: Missing 'Constraints:'");
    if (!tMatch) throw new Error("CODING: Missing 'Testcases:'");

    const question_text = qMatch[1].trim();
    const marks = parseInt(mMatch[1]);
    const input_format = iMatch[1].trim();
    const output_format = oMatch[1].trim();
    const constraints = cMatch[1].trim();
    const testcasesRaw = tMatch[1].trim();
    const explanation = expMatch ? expMatch[1].trim() : undefined;

    // Parse Testcases
    // Format: Input: <text>\nOutput: <text>\nPublic: true|false
    const testcases: Testcase[] = [];

    // We split by "Input:"
    const tcBlocks = testcasesRaw.split(/Input:\s*/).filter(t => t.trim());

    for (const block of tcBlocks) {
        // Output: ... Public: ...
        const outMatch = block.match(/([\s\S]*?)\nPublic:\s*(true|false)/i);
        // Sometimes "Output:" might be explicitly there? "Input: <text> \n Output: <text>"
        // The split removed "Input: ".
        // The block is "<text> \n Output: <text> \n Public: true"

        const outputSplit = block.split(/Output:\s*/);
        if (outputSplit.length !== 2) continue; // Skip malformed

        const inputVal = outputSplit[0].trim();
        const rest = outputSplit[1];

        const publicMatch = rest.match(/([\s\S]*?)\nPublic:\s*(true|false)/i);
        if (!publicMatch) continue;

        const outputVal = publicMatch[1].trim();
        const isPublic = publicMatch[2].toLowerCase() === 'true';

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
