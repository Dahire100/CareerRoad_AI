"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { findJobsAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import type { FindPotentialJobMatchesOutput } from "@/ai/flows/job-match-analyzer";

const formSchema = z.object({
  jobDescription: z.string().min(50, "Please paste a job description."),
  resumeFile: (typeof window === 'undefined') ? z.any() : z.instanceof(FileList).refine(files => files?.length === 1, "Resume file is required."),
});

const JobMatchAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FindPotentialJobMatchesOutput | null>(null);
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setResumeDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!resumeDataUri) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a resume file first.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const actionResult = await findJobsAction({
        resumeDataUri: resumeDataUri,
        jobDescription: values.jobDescription
    });

    setLoading(false);

    if ("error" in actionResult) {
      toast({
        variant: "destructive",
        title: "Error",
        description: actionResult.error,
      });
    } else {
      setResult(actionResult);
    }
  }
  
  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Find Your Best-Fit Job</CardTitle>
        <CardDescription>Upload your resume and paste a job description to see how well you match.</CardDescription>
      </CardHeader>
      <CardContent>
        {!loading && !result && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="resumeFile"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Upload Your Resume</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept=".pdf,.doc,.docx,.txt"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    field.onChange(e.target.files);
                                    handleFileChange(e);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Paste the full job description here..." {...field} rows={12} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg" disabled={!resumeDataUri}>Analyze Job Match</Button>
            </form>
          </Form>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 h-64">
            <LoadingSpinner className="h-12 w-12 text-primary" />
            <p className="text-muted-foreground animate-pulse">Our AI is analyzing your match potential...</p>
          </div>
        )}
        {result && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl text-center">Job Match Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="relative h-32 w-32">
                  <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--secondary))" strokeWidth="12" />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="12"
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={(2 * Math.PI * 54) * (1 - result.matchScore / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold font-headline text-primary">{result.matchScore}</span>
                    <span className="text-xl font-bold font-headline text-muted-foreground">/100</span>
                  </div>
                </div>
                <p className="text-center text-muted-foreground mt-2 text-sm">This score estimates how well your resume matches the job description.</p>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Potential Job Matches</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {result.matches.map((match, index) => (
                            <Badge key={index} variant="secondary" className="text-base px-3 py-1">{match}</Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground/90 whitespace-pre-wrap">{result.analysis}</p>
                </CardContent>
            </Card>
            <Button onClick={() => {
                setResult(null);
                setResumeDataUri(null);
                form.reset();
                if(fileInputRef.current) fileInputRef.current.value = "";
            }} variant="outline" className="w-full">Analyze Another Job</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobMatchAnalyzer;
