'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a user's resume and finding potential job matches.
 *
 * - findPotentialJobMatches - A function that takes a resume and job description as input and returns a list of potential job matches.
 * - FindPotentialJobMatchesInput - The input type for the findPotentialJobMatches function.
 * - FindPotentialJobMatchesOutput - The return type for the findPotentialJobMatches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindPotentialJobMatchesInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The job description to match against the resume.'),
});
export type FindPotentialJobMatchesInput = z.infer<typeof FindPotentialJobMatchesInputSchema>;

const FindPotentialJobMatchesOutputSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A score from 0 to 100 indicating how well the resume matches the job description.'),
  matches: z
    .array(z.string())
    .describe('A list of potential job matches based on the resume and job description.'),
  analysis: z.string().describe('An analysis of the resume and how well it matches the job description.'),
});
export type FindPotentialJobMatchesOutput = z.infer<typeof FindPotentialJobMatchesOutputSchema>;

export async function findPotentialJobMatches(
  input: FindPotentialJobMatchesInput
): Promise<FindPotentialJobMatchesOutput> {
  return findPotentialJobMatchesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findPotentialJobMatchesPrompt',
  input: {schema: FindPotentialJobMatchesInputSchema},
  output: {schema: FindPotentialJobMatchesOutputSchema},
  prompt: `You are a career expert. Analyze the resume and job description provided to identify potential job matches.

    Resume:
    {{media url=resumeDataUri}}

    Job Description:
    {{jobDescription}}

    Based on your analysis, provide a match score, a list of potential job titles, and an explanation of why the resume is a good or bad fit.
    - The 'matchScore' should be an integer between 0 and 100, representing the compatibility between the resume and the job description.
    - The 'matches' array should list potential job titles from the job description or similar roles.
    - The 'analysis' should explain the reasoning behind the score, highlighting strengths and weaknesses of the resume in relation to the job.`,
});

const findPotentialJobMatchesFlow = ai.defineFlow(
  {
    name: 'findPotentialJobMatchesFlow',
    inputSchema: FindPotentialJobMatchesInputSchema,
    outputSchema: FindPotentialJobMatchesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
