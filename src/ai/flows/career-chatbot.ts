'use server';

/**
 * @fileOverview Provides career advice via an AI-powered chatbot.
 *
 * - getCareerAdviceFromChatbot - A function to get career advice from the chatbot.
 * - CareerChatbotInput - The input type for the getCareerAdviceFromChatbot function.
 * - CareerChatbotOutput - The return type for the getCareerAdviceFromChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerChatbotInputSchema = z.object({
  question: z.string().describe('The career-related question from the user.'),
});
export type CareerChatbotInput = z.infer<typeof CareerChatbotInputSchema>;

const CareerChatbotOutputSchema = z.object({
  advice: z.string().describe('The AI-generated career advice.'),
});
export type CareerChatbotOutput = z.infer<typeof CareerChatbotOutputSchema>;

export async function getCareerAdviceFromChatbot(input: CareerChatbotInput): Promise<CareerChatbotOutput> {
  return careerChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerChatbotPrompt',
  input: {schema: CareerChatbotInputSchema},
  output: {schema: CareerChatbotOutputSchema},
  prompt: `You are a career coach chatbot. A user is asking for career advice. Answer the user's question with helpful advice.

User's Question: {{{question}}}`,
});

const careerChatbotFlow = ai.defineFlow(
  {
    name: 'careerChatbotFlow',
    inputSchema: CareerChatbotInputSchema,
    outputSchema: CareerChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
