"use client";

import { useMemo } from "react";
import type { RoadmapOutput } from "@/ai/flows/roadmap-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Flame, Target, CalendarDays, BarChart, CheckSquare } from "lucide-react";
import { subDays, isSameDay } from "date-fns";

type LearningTrackerProps = {
  roadmap: RoadmapOutput | null;
  completedItems: Record<string, string>;
};

const LearningTracker = ({ roadmap, completedItems }: LearningTrackerProps) => {

  const { totalItems, completedCount, progressPercentage, completionDates, streak } = useMemo(() => {
    if (!roadmap) {
      return { totalItems: 0, completedCount: 0, progressPercentage: 0, completionDates: [], streak: 0 };
    }

    const total = roadmap.months.reduce((acc, month) => {
      return acc + month.skills.length + month.projects.length + month.certifications.length + month.job_prep.length;
    }, 0);

    const completed = Object.keys(completedItems).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    const uniqueDateStrings = [...new Set(Object.values(completedItems).map(iso => iso.split('T')[0]))];
    const dates = uniqueDateStrings.map(ds => new Date(ds + 'T00:00:00'));
    dates.sort((a,b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    if (dates.length > 0) {
        const today = new Date();
        const mostRecentCompletion = dates[0];

        if (isSameDay(mostRecentCompletion, today) || isSameDay(mostRecentCompletion, subDays(today,1))) {
            currentStreak = 1;
            let lastDate = mostRecentCompletion;
            for (let i = 1; i < dates.length; i++) {
                const currentDate = dates[i];
                const expectedDate = subDays(lastDate, 1);
                if (isSameDay(currentDate, expectedDate)) {
                    currentStreak++;
                    lastDate = currentDate;
                } else if (!isSameDay(currentDate, lastDate)) { // break if there is a gap and not the same day
                    break;
                }
            }
        }
    }

    return {
      totalItems: total,
      completedCount: completed,
      progressPercentage: progress,
      completionDates: dates,
      streak: currentStreak,
    };
  }, [roadmap, completedItems]);

  if (!roadmap) {
    return (
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Learning Tracker</CardTitle>
          <CardDescription>Your progress will appear here once you generate a roadmap.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
          <BarChart className="h-16 w-16 mb-4 text-primary/30" />
          <p className="text-lg font-medium">No roadmap found.</p>
          <p>Go to the "AI Roadmap" tab to create one!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Total Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{Math.round(progressPercentage)}%</div>
            <p className="text-xs text-muted-foreground">{completedCount} of {totalItems} tasks completed</p>
            <Progress value={progressPercentage} className="mt-4 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{streak} days</div>
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-body">Tasks Completed</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-headline">{completedCount}</div>
                <p className="text-xs text-muted-foreground">out of {totalItems} total tasks</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Your Activity Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="multiple"
            selected={completionDates}
            disabled={{ before: roadmap ? new Date(roadmap.months[0].month + "/01/2024") : new Date() }}
            className="rounded-md border p-0"
            classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            }}
            showOutsideDays={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningTracker;
