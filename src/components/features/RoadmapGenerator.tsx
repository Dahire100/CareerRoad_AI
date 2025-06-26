"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateRoadmapAction } from "@/lib/actions";
import type { RoadmapOutput } from "@/ai/flows/roadmap-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Briefcase, Award, Lightbulb, ClipboardList, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


const formSchema = z.object({
  degree: z.string().min(2, "Degree is required."),
  skills: z.string().min(2, "Skills are required."),
  interests: z.string().min(2, "Interests are required."),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    required_error: "Please select your skill level.",
  }),
});

type ListSectionProps = {
  title: string;
  items: string[];
  category: string;
  monthIndex: number;
  icon: LucideIcon;
  completedItems: Record<string, string>;
  toggleItem: (key: string) => void;
};

const ListSection = ({ title, items, category, monthIndex, icon: Icon, completedItems, toggleItem }: ListSectionProps) => {
  if (items.length === 0) return null;

  return (
    <Card className="bg-secondary/50">
      <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
        <Icon className="h-6 w-6 text-primary" />
        <CardTitle className="font-headline text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item, itemIndex) => {
            const key = `${monthIndex}-${category}-${itemIndex}`;
            return (
              <li key={key} className="flex items-start gap-3">
                <Checkbox
                  id={key}
                  checked={!!completedItems[key]}
                  onCheckedChange={() => toggleItem(key)}
                  className="mt-1"
                />
                <Label htmlFor={key} className={cn("flex-1 cursor-pointer", !!completedItems[key] && 'line-through text-muted-foreground')}>
                  {item}
                </Label>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

type RoadmapDisplayProps = {
  roadmap: RoadmapOutput;
  completedItems: Record<string, string>;
  toggleItem: (key: string) => void;
};

const RoadmapDisplay = ({ roadmap, completedItems, toggleItem }: RoadmapDisplayProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-headline font-bold text-primary">{roadmap.title}</h3>
        <p className="text-muted-foreground max-w-3xl mx-auto">{roadmap.overview}</p>
      </div>
      
      <Accordion type="multiple" defaultValue={['month-0']} className="w-full space-y-4">
        {roadmap.months.map((month, monthIndex) => (
          <AccordionItem value={`month-${monthIndex}`} key={monthIndex} className="border rounded-lg bg-card shadow-sm overflow-hidden">
            <AccordionTrigger className="p-6 font-headline text-lg hover:no-underline data-[state=open]:bg-secondary/30">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">{month.month}</span>
                <span>{month.theme}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ListSection title="Skills to Learn" items={month.skills} category="skills" monthIndex={monthIndex} icon={ClipboardList} completedItems={completedItems} toggleItem={toggleItem} />
                    <ListSection title="Project Ideas" items={month.projects} category="projects" monthIndex={monthIndex} icon={Lightbulb} completedItems={completedItems} toggleItem={toggleItem} />
                    <ListSection title="Certifications" items={month.certifications} category="certifications" monthIndex={monthIndex} icon={Award} completedItems={completedItems} toggleItem={toggleItem} />
                    <ListSection title="Job Prep" items={month.job_prep} category="job_prep" monthIndex={monthIndex} icon={Briefcase} completedItems={completedItems} toggleItem={toggleItem} />
                </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

type RoadmapGeneratorProps = {
  roadmap: RoadmapOutput | null;
  setRoadmap: (roadmap: RoadmapOutput | null) => void;
  completedItems: Record<string, string>;
  toggleItem: (key: string) => void;
  setCompletedItems: (items: Record<string, string>) => void;
}

const RoadmapGenerator = ({ roadmap, setRoadmap, completedItems, toggleItem, setCompletedItems }: RoadmapGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      degree: "",
      skills: "",
      interests: "",
      skillLevel: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setRoadmap(null);
    setCompletedItems({});
    const result = await generateRoadmapAction(values);
    setLoading(false);
    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      setRoadmap(result);
    }
  }
  
  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Generate Your Career Roadmap</CardTitle>
        <CardDescription>Tell us about yourself, and our AI will create a personalized 6-month plan to guide your career growth.</CardDescription>
      </CardHeader>
      <CardContent>
        {!loading && !roadmap && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Degree/Field of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science, Marketing" {...field} suppressHydrationWarning />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="skillLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Current Skill Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your current skill level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Current Skills</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Python, Graphic Design, Public Speaking" {...field} suppressHydrationWarning />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Career Interests</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Machine Learning, Digital Marketing, Project Management" {...field} suppressHydrationWarning />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">Generate Roadmap</Button>
            </form>
          </Form>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 h-64">
            <LoadingSpinner className="h-12 w-12 text-primary" />
            <p className="text-muted-foreground animate-pulse">Our AI is crafting your personalized roadmap...</p>
          </div>
        )}
        {roadmap && (
          <div className="animate-in fade-in-50 duration-500">
            <RoadmapDisplay roadmap={roadmap} completedItems={completedItems} toggleItem={toggleItem} />
            <Button onClick={() => {
                setRoadmap(null);
                setCompletedItems({});
                form.reset();
            }} variant="outline" className="mt-6 w-full">Create a New Roadmap</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoadmapGenerator;
