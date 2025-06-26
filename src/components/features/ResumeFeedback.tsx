"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { analyzeResumeAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input";
import { UploadCloud, FileText, CheckCircle, Lightbulb } from "lucide-react";
import type { AnalyzeResumeForImprovementsOutput } from "@/ai/flows/resume-analyzer";

const formSchema = z.object({
  jobDescription: z.string().optional(),
});

const FeedbackDisplay = ({ feedback, onReset }: { feedback: AnalyzeResumeForImprovementsOutput, onReset: () => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl text-center">Estimated ATS Score</CardTitle>
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
                strokeDashoffset={(2 * Math.PI * 54) * (1 - feedback.atsScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold font-headline text-primary">{feedback.atsScore}</span>
              <span className="text-xl font-bold font-headline text-muted-foreground">/100</span>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-2 text-sm">This score estimates how well your resume might perform with automated screening systems.</p>
        </CardContent>
      </Card>
      
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Overall Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90">{feedback.overallFeedback}</p>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-xl font-headline font-semibold">Section-by-Section Analysis</h3>
        {feedback.sectionFeedback.map((section, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="font-headline text-lg">{section.sectionTitle}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-6">
                {section.feedback.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{item.point}</p>
                      {item.example && (
                        <div className="mt-2 flex items-start gap-3 text-sm text-muted-foreground p-3 bg-secondary/70 rounded-md border">
                          <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-yellow-500"/>
                          <div>
                            <span className="font-semibold text-foreground/80">Example:</span>
                            <p className="italic">"{item.example}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={onReset} variant="outline" className="w-full">
        Analyze Another Resume
      </Button>
    </div>
  );
};


const ResumeFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<AnalyzeResumeForImprovementsOutput | null>(null);
  const { toast } = useToast();
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text) {
      const dataUri = 'data:text/plain;base64,' + Buffer.from(text).toString('base64');
      setResumeDataUri(dataUri);
    } else {
      setResumeDataUri(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setResumeDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setResumeDataUri(null);
        setFileName(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!resumeDataUri) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide your resume by pasting text or uploading a file.",
      });
      return;
    }
    
    setLoading(true);
    setFeedback(null);
    
    const result = await analyzeResumeAction({
        resumeDataUri: resumeDataUri,
        jobDescription: values.jobDescription
    });

    setLoading(false);

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      setFeedback(result);
    }
  }
  
  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Get AI-Powered Resume Feedback</CardTitle>
        <CardDescription>Provide your resume and an optional job description to get actionable tips for improvement.</CardDescription>
      </CardHeader>
      <CardContent>
        {!loading && !feedback && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={inputType} onValueChange={(value) => setInputType(value as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text">
                            <FileText className="mr-2 h-4 w-4"/>
                            Paste Text
                        </TabsTrigger>
                        <TabsTrigger value="file">
                            <UploadCloud className="mr-2 h-4 w-4"/>
                            Upload File
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="mt-4">
                        <FormItem>
                            <FormLabel>Your Resume Text</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Paste the full text of your resume here..." 
                                    rows={15}
                                    onChange={handleTextChange}
                                />
                            </FormControl>
                        </FormItem>
                    </TabsContent>
                    <TabsContent value="file" className="mt-4">
                        <FormItem>
                            <FormLabel>Upload Your Resume</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input 
                                        type="file" 
                                        accept=".pdf,.doc,.docx,.txt"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex justify-center items-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                        {fileName ? (
                                            <p className="text-center text-sm font-medium">{fileName}</p>
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                <UploadCloud className="mx-auto h-8 w-8 mb-2" />
                                                <p>Click to upload or drag and drop</p>
                                                <p className="text-xs">PDF, DOC, DOCX, or TXT</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </FormControl>
                        </FormItem>
                    </TabsContent>
                </Tabs>
              
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste a relevant job description to tailor the feedback..." {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg" disabled={loading || !resumeDataUri}>Analyze My Resume</Button>
            </form>
          </Form>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 h-64">
            <LoadingSpinner className="h-12 w-12 text-primary" />
            <p className="text-muted-foreground animate-pulse">Our AI is reviewing your resume...</p>
          </div>
        )}
        {feedback && (
          <FeedbackDisplay 
            feedback={feedback}
            onReset={() => {
                setFeedback(null);
                setResumeDataUri(null);
                setFileName(null);
                form.reset();
                if(fileInputRef.current) fileInputRef.current.value = "";
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeFeedback;
