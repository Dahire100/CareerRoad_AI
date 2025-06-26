'use server';
/**
 * @fileOverview Generates a personalized 6-month career roadmap based on user inputs.
 *
 * - generatePersonalizedRoadmap - A function that handles the roadmap generation process.
 * - RoadmapInput - The input type for the generatePersonalizedRoadmap function.
 * - RoadmapOutput - The return type for the generatePersonalizedRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RoadmapInputSchema = z.object({
  degree: z.string().describe('Your degree or field of study.'),
  skills: z.string().describe('Your existing skills, separated by commas.'),
  interests: z.string().describe('Your career interests, separated by commas.'),
  skillLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('Your self-assessed skill level.'),
});
export type RoadmapInput = z.infer<typeof RoadmapInputSchema>;

const MonthSchema = z.object({
    month: z.number().describe("The month number (e.g., 1, 2, 3)."),
    theme: z.string().describe("The overarching theme for the month."),
    skills: z.array(z.string()).describe("A list of skills to learn during the month."),
    projects: z.array(z.string()).describe("A list of projects to work on."),
    certifications: z.array(z.string()).describe("A list of relevant certifications to pursue."),
    job_prep: z.array(z.string()).describe("A list of job preparation activities."),
});

const RoadmapOutputSchema = z.object({
    title: z.string().describe("The main title of the career roadmap."),
    overview: z.string().describe("A brief summary or overview of the roadmap."),
    months: z.array(MonthSchema).describe("A list of monthly plans, typically for 6 months."),
});
export type RoadmapOutput = z.infer<typeof RoadmapOutputSchema>;

export async function generatePersonalizedRoadmap(input: RoadmapInput): Promise<RoadmapOutput> {
  return generatePersonalizedRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'roadmapGeneratorPrompt',
  input: {schema: RoadmapInputSchema},
  output: {schema: RoadmapOutputSchema},
  prompt: `You are a career advisor expert specializing in creating personalized 6-month career roadmaps.

  Based on the user's degree, skills, interests, and self-assessed skill level, create a detailed JSON object representing a 6-month roadmap. The roadmap should be tailored to their level. For example, a beginner's roadmap should focus on fundamentals, while an advanced one should cover more specialized topics.

  The JSON should have a 'title', an 'overview', and a 'months' array. Each object in the 'months' array should represent one month and include the month number, a theme, and arrays for 'skills', 'projects', 'certifications', and 'job_prep'. Ensure the grammar is correct and the structure is logical and easy to follow.

  Skill Level: {{{skillLevel}}}
  Degree: {{{degree}}}
  Skills: {{{skills}}}
  Interests: {{{interests}}}
  `,
});

const generatePersonalizedRoadmapFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedRoadmapFlow',
    inputSchema: RoadmapInputSchema,
    outputSchema: RoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
