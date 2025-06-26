"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Route, FileText, Sparkles, Bot, CheckSquare, LineChart, User } from "lucide-react";
import RoadmapGenerator from "@/components/features/RoadmapGenerator";
import ResumeFeedback from "@/components/features/ResumeFeedback";
import JobMatchAnalyzer from "@/components/features/JobMatchAnalyzer";
import CareerChatbot from "@/components/features/CareerChatbot";
import LearningTracker from "@/components/features/LearningTracker";
import type { RoadmapOutput } from "@/ai/flows/roadmap-generator";
import PlacementInsights from "@/components/features/PlacementInsights";
import ProfilePage from "@/components/features/ProfilePage";

const Dashboard = () => {
  const [roadmap, setRoadmap] = useState<RoadmapOutput | null>(null);
  const [completedItems, setCompletedItems] = useState<Record<string, string>>({});

  const toggleItemCompletion = (key: string) => {
    setCompletedItems(prev => {
      const newCompleted = { ...prev };
      if (newCompleted[key]) {
        delete newCompleted[key];
      } else {
        newCompleted[key] = new Date().toISOString();
      }
      return newCompleted;
    });
  };
  
  return (
    <Tabs defaultValue="roadmap" className="w-full">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-7 gap-2 h-auto md:h-20 bg-secondary/80 p-2 rounded-lg backdrop-blur-sm">
        <TabsTrigger value="roadmap" className="flex items-center gap-2 py-2.5">
          <Route className="h-5 w-5" />
          <span className="font-semibold">AI Roadmap</span>
        </TabsTrigger>
        <TabsTrigger value="resume-feedback" className="flex items-center gap-2 py-2.5">
          <FileText className="h-5 w-5" />
          <span className="font-semibold">Resume Feedback</span>
        </TabsTrigger>
        <TabsTrigger value="job-match" className="flex items-center gap-2 py-2.5">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">Job Matcher</span>
        </TabsTrigger>
        <TabsTrigger value="chatbot" className="flex items-center gap-2 py-2.5">
          <Bot className="h-5 w-5" />
          <span className="font-semibold">Career Chatbot</span>
        </TabsTrigger>
        <TabsTrigger value="tracker" className="flex items-center gap-2 py-2.5">
          <CheckSquare className="h-5 w-5" />
          <span className="font-semibold">Tracker</span>
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center gap-2 py-2.5">
          <LineChart className="h-5 w-5" />
          <span className="font-semibold">Insights</span>
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-2 py-2.5">
          <User className="h-5 w-5" />
          <span className="font-semibold">Profile</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="roadmap" className="mt-6">
        <RoadmapGenerator
          roadmap={roadmap}
          setRoadmap={setRoadmap}
          completedItems={completedItems}
          toggleItem={toggleItemCompletion}
          setCompletedItems={setCompletedItems}
        />
      </TabsContent>
      <TabsContent value="resume-feedback" className="mt-6">
        <ResumeFeedback />
      </TabsContent>
      <TabsContent value="job-match" className="mt-6">
        <JobMatchAnalyzer />
      </TabsContent>
      <TabsContent value="chatbot" className="mt-6">
        <CareerChatbot />
      </TabsContent>
      <TabsContent value="tracker" className="mt-6">
        <LearningTracker roadmap={roadmap} completedItems={completedItems} />
      </TabsContent>
      <TabsContent value="insights" className="mt-6">
        <PlacementInsights />
      </TabsContent>
      <TabsContent value="profile" className="mt-6">
        <ProfilePage />
      </TabsContent>
    </Tabs>
  );
};

export default Dashboard;
