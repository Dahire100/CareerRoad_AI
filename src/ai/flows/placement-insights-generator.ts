'use server';
/**
 * @fileOverview Generates placement insights data.
 *
 * - generatePlacementInsights - A function that handles the insights generation process.
 * - PlacementInsightsInput - The input type for the generatePlacementInsights function.
 * - PlacementInsightsOutput - The return type for the generatePlacementInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlacementInsightsInputSchema = z.object({
  role: z.string().describe('The target job role or industry for which to generate insights.'),
});
export type PlacementInsightsInput = z.infer<typeof PlacementInsightsInputSchema>;

const TrendDataSchema = z.object({
  month: z.string().describe("The month for the data point (e.g., 'Jan', 'Feb')."),
  hires: z.number().describe('The number of hires in that month.'),
});

const CompanyDataSchema = z.object({
  name: z.string().describe('The name of the company.'),
  hires: z.number().describe('The number of hires by that company.'),
});

const SalaryDataSchema = z.object({
  skill: z.string().describe('The skill or domain.'),
  averageSalary: z.number().describe('The average annual salary for that skill in USD.'),
});

const PlacementInsightsOutputSchema = z.object({
  trends: z.array(TrendDataSchema).describe('Hiring trends over the last 6 months.'),
  topCompanies: z.array(CompanyDataSchema).describe('Top 5 hiring companies.'),
  averageSalaries: z.array(SalaryDataSchema).describe('Average salaries for 5 key skills.'),
  summary: z.string().describe('A brief text summary of the key market insights.')
});
export type PlacementInsightsOutput = z.infer<typeof PlacementInsightsOutputSchema>;

export async function generatePlacementInsights(
  input: PlacementInsightsInput
): Promise<PlacementInsightsOutput> {
  return generatePlacementInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'placementInsightsGeneratorPrompt',
  input: {schema: PlacementInsightsInputSchema},
  output: {schema: PlacementInsightsOutputSchema},
  prompt: `You are a job market analyst. Your task is to generate realistic placement insights data strictly for the job role specified by the user. Do not substitute or infer a different role.

  The target role is: '{{{role}}}'

  For this specific role, provide the following:
  1. 'trends': Hiring trends data for the last 6 months. The months should be abbreviated (e.g., 'Jan', 'Feb').
  2. 'topCompanies': A list of the top 5 hiring companies for this role.
  3. 'averageSalaries': A list of average annual salaries in USD for 5 key skills directly related to the '{{{role}}}' role.
  4. 'summary': A concise, professional summary of the key takeaways from the data, specifically for the '{{{role}}}' market.

  The output must be in the specified JSON format. The data must be plausible and directly relevant to the provided role.`,
});

const generatePlacementInsightsFlow = ai.defineFlow(
  {
    name: 'generatePlacementInsightsFlow',
    inputSchema: PlacementInsightsInputSchema,
    outputSchema: PlacementInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
