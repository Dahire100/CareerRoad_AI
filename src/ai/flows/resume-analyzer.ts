// use server'
'use server';

/**
 * @fileOverview AI-powered resume analyzer for identifying areas of improvement.
 *
 * - analyzeResumeForImprovements - A function that analyzes a resume and provides feedback for improvements.
 * - AnalyzeResumeForImprovementsInput - The input type for the analyzeResumeForImprovements function.
 * - AnalyzeResumeForImprovementsOutput - The return type for the analyzeResumeForImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeForImprovementsInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The user's resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z
    .string()
    .optional()
    .describe('Optional job description to tailor the resume for.'),
});
export type AnalyzeResumeForImprovementsInput = z.infer<
  typeof AnalyzeResumeForImprovementsInputSchema
>;

const FeedbackItemSchema = z.object({
  point: z.string().describe('A specific piece of feedback or advice.'),
  example: z.string().optional().describe('An example illustrating the feedback point.'),
});

const ResumeSectionFeedbackSchema = z.object({
  sectionTitle: z
    .string()
    .describe("The title of the resume section (e.g., 'Summary', 'Work Experience')."),
  feedback: z.array(FeedbackItemSchema).describe('A list of feedback points for this section.'),
});

const AnalyzeResumeForImprovementsOutputSchema = z.object({
  atsScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'An estimated Applicant Tracking System (ATS) score from 0 to 100, representing how well the resume is optimized for automated screening.'
    ),
  overallFeedback: z
    .string()
    .describe(
      "A general summary of the feedback, providing a high-level overview of the resume's strengths and areas for improvement."
    ),
  sectionFeedback: z
    .array(ResumeSectionFeedbackSchema)
    .describe('Detailed, section-by-section feedback on the resume.'),
});

export type AnalyzeResumeForImprovementsOutput = z.infer<
  typeof AnalyzeResumeForImprovementsOutputSchema
>;

export async function analyzeResumeForImprovements(
  input: AnalyzeResumeForImprovementsInput
): Promise<AnalyzeResumeForImprovementsOutput> {
  return analyzeResumeForImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumeForImprovementsPrompt',
  input: {schema: AnalyzeResumeForImprovementsInputSchema},
  output: {schema: AnalyzeResumeForImprovementsOutputSchema},
  prompt: `You are an expert resume writer and career coach. Analyze the provided resume and generate structured feedback to help the user improve it. If a job description is provided, tailor the feedback to that specific role.

Resume:
{{media url=resumeDataUri}}

{{#if jobDescription}}
Job Description for tailoring:
{{{jobDescription}}}
{{/if}}

Provide your feedback in a structured JSON format. The feedback should include an estimated Applicant Tracking System (ATS) score, an overall summary, and then a breakdown of feedback for each major resume section (e.g., "Summary", "Work Experience", "Skills", "Education").

- The 'atsScore' should be an integer between 0 and 100, reflecting keyword optimization (especially against the job description if provided), formatting, and general ATS-friendliness.
- The 'overallFeedback' should be a concise paragraph summarizing the key takeaways.
- The 'sectionFeedback' array should contain objects for each resume section you're providing feedback on.
- For each section, provide specific, actionable points of feedback. Where applicable, include examples.
- Be encouraging and professional in your tone.
`,
});

const analyzeResumeForImprovementsFlow = ai.defineFlow(
  {
    name: 'analyzeResumeForImprovementsFlow',
    inputSchema: AnalyzeResumeForImprovementsInputSchema,
    outputSchema: AnalyzeResumeForImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
