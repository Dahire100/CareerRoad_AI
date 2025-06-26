'use server';

import { generatePersonalizedRoadmap, RoadmapInput, RoadmapOutput } from '@/ai/flows/roadmap-generator';
import { analyzeResumeForImprovements, AnalyzeResumeForImprovementsInput, AnalyzeResumeForImprovementsOutput } from '@/ai/flows/resume-analyzer';
import { findPotentialJobMatches, FindPotentialJobMatchesInput, FindPotentialJobMatchesOutput } from '@/ai/flows/job-match-analyzer';
import { getCareerAdviceFromChatbot, CareerChatbotInput, CareerChatbotOutput } from '@/ai/flows/career-chatbot';
import { generatePlacementInsights, PlacementInsightsInput, PlacementInsightsOutput } from '@/ai/flows/placement-insights-generator';

export async function generateRoadmapAction(input: RoadmapInput): Promise<RoadmapOutput | { error: string }> {
  try {
    const result = await generatePersonalizedRoadmap(input);
    if (!result || !result.title || !result.months || result.months.length === 0) {
      throw new Error("Failed to generate roadmap. The AI returned an empty or invalid response.");
    }
    return result;
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "An unknown error occurred." };
  }
}

export async function analyzeResumeAction(input: AnalyzeResumeForImprovementsInput): Promise<AnalyzeResumeForImprovementsOutput | { error: string }> {
  try {
    const result = await analyzeResumeForImprovements(input);
     if (!result || result.atsScore === undefined || !result.overallFeedback || !result.sectionFeedback) {
      throw new Error("Failed to analyze resume. The AI returned an empty or invalid response.");
    }
    return result;
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "An unknown error occurred." };
  }
}

export async function findJobsAction(input: FindPotentialJobMatchesInput): Promise<FindPotentialJobMatchesOutput | { error: string }> {
  try {
    const result = await findPotentialJobMatches(input);
    if (!result || !result.analysis || result.matchScore === undefined) {
      throw new Error("Failed to find job matches. The AI returned an empty or invalid response.");
    }
    return result;
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "An unknown error occurred." };
  }
}

export async function getChatbotResponseAction(input: CareerChatbotInput): Promise<CareerChatbotOutput | { error:string }> {
  try {
    const result = await getCareerAdviceFromChatbot(input);
    if (!result || !result.advice) {
      throw new Error("Failed to get chatbot response. The AI returned an empty response.");
    }
    return result;
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "An unknown error occurred." };
  }
}

export async function generatePlacementInsightsAction(input: PlacementInsightsInput): Promise<PlacementInsightsOutput | { error: string }> {
  try {
    const result = await generatePlacementInsights(input);
    if (
      !result ||
      !result.summary ||
      !result.trends || result.trends.length === 0 ||
      !result.topCompanies || result.topCompanies.length === 0 ||
      !result.averageSalaries || result.averageSalaries.length === 0
    ) {
      throw new Error("Failed to generate placement insights. The AI returned an empty or invalid response.");
    }
    return result;
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "An unknown error occurred." };
  }
}
