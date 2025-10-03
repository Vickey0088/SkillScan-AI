// api/analyze/route.js
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { extractTextFromFile } from '../../components/ai-resume-analyser/lib/parse';
import { score } from '../../components/ai-resume-analyser/lib/rubric';

export const runtime = 'nodejs';

// --- Constants & Configuration ---
const MAX_JD_CHARS = 8000;
const MAX_RESUME_CHARS = 500000;
const MODEL_NAME = "gemini-1.5-flash";

// --- Gemini AI Integration ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generationConfig = {
  temperature: 0.4,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Calls the Gemini API to get a high-quality, contextual analysis of the resume.
 * @param {string} resumeText - The text extracted from the resume.
 * @param {string} jobDescription - The job description text (if provided).
 * @returns {Promise<object>} A structured JSON object with the AI's analysis.
 */
async function getAiAnalysis(resumeText, jobDescription) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('The GEMINI_API_KEY environment variable is not configured on the server.');
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig, safetySettings });

  const jd_context = jobDescription
    ? `The resume should be analyzed in the context of this job description:\n<job_description>${jobDescription}</job_description>`
    : "No job description was provided, so analyze the resume for a general software developer role.";

  const prompt = `
    You are an expert technical recruiter and career coach. Your task is to provide a detailed, constructive, and critical analysis of the provided resume text.
    ${jd_context}

    Resume Text:
    <resume_text>
    ${resumeText}
    </resume_text>

    Your response MUST be a single, valid JSON object. Do not include any markdown formatting (like \`\`\`json) or any text outside of the JSON object.

    The JSON object must have the following keys:
    1.  "summary_improved_long": A professionally rewritten, impactful summary for the resume (3-4 sentences). If no summary exists, create one from the resume's content.
    2.  "strengths": An array of 3-5 of the candidate's strongest qualifications. Each item in the array MUST be a single string.
    3.  "recommendations": An array of 3-5 specific, actionable recommendations for improvement. Each item in the array MUST be a single string.
    4.  "job_description_match": An object containing:
        - "overall_fit_score": A number (0-100) representing how well the resume matches the job description.
        - "justification": A brief (1-2 sentence) explanation for the score.
        - "missing_skills": An array of the most important skills or keywords from the job description that are missing from the resume. If no JD is provided, list skills commonly expected for a senior role that are missing.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get analysis from the AI model. It may have returned an unexpected format.");
  }
}

// --- Helper Functions ---
function trimCap(input, max) {
  return (typeof input === 'string' && input.length > max) ? input.slice(0, max) : (input || '');
}
function badRequest(message) {
  return NextResponse.json({ error: message, success: false }, { status: 400 });
}
function serverError(err) {
  const msg = (err instanceof Error) ? err.message : 'An internal server error occurred.';
  console.error('Server Error:', err);
  return NextResponse.json({ error: msg, success: false }, { status: 500 });
}

// --- Main API Route Handler ---
export async function POST(req) {
  const startTime = Date.now();
  try {
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      return badRequest('Invalid content type; expected multipart/form-data.');
    }

    const form = await req.formData();
    const file = form.get('resume');

    if (!(file instanceof File)) {
      return badRequest('Resume file is missing or invalid.');
    }
    if (file.size > 10 * 1024 * 1024) {
      return badRequest('File size exceeds the 10MB limit.');
    }

    const jdRaw = form.get('jobDescription') || '';
    const jobDescription = trimCap(jdRaw.toString(), MAX_JD_CHARS);

    const resumeTextRaw = await extractTextFromFile(file, file.name);
    const resumeText = trimCap(resumeTextRaw, MAX_RESUME_CHARS);
    if (!resumeText) {
      return badRequest('Could not extract any readable text from the uploaded file.');
    }

    let aiResult = null;
    try {
      aiResult = await getAiAnalysis(resumeText, jobDescription);
    } catch (aiError) {
      console.warn('AI analysis failed, proceeding without AI insights:', aiError.message);
    }

    const atsResult = score(resumeText, jobDescription);

    // --- Data Sanitization Step ---
    // This new block ensures the data sent to the frontend is always in the correct format,
    // preventing the React "Objects are not valid as a React child" error.
    const normalizedAiResult = aiResult ? {
      ...aiResult,
      strengths: (aiResult.strengths || []).map(item =>
        typeof item === 'object' ? item.strength || item.justification || '' : item
      ).filter(Boolean),
      recommendations: (aiResult.recommendations || []).map(item =>
        typeof item === 'object' ? item.recommendation || '' : item
      ).filter(Boolean),
    } : {
      summary_improved_long: '',
      strengths: [],
      recommendations: [],
      job_description_match: { overall_fit_score: 0, justification: 'AI analysis unavailable', missing_skills: [] }
    };

    const payload = {
      success: true,
      ats: {
        ...atsResult,
        keyword_match_score: normalizedAiResult.job_description_match?.overall_fit_score ?? atsResult.score,
      },
      ai: {
        ...normalizedAiResult,
        ats_warnings: atsResult.warnings || [],
      },
      meta: {
        filename: file.name,
        fileSize: file.size,
        textLength: resumeText.length,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        analysis_method: 'gemini_enhanced_v3_robust'
      }
    };

    console.log(`Analysis for ${file.name} completed in ${payload.meta.processingTime}ms.`);
    return NextResponse.json(payload);

  } catch (error) {
    return serverError(error);
  }
}

