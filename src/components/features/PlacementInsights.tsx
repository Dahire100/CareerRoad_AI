"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { generatePlacementInsightsAction } from "@/lib/actions";
import type { PlacementInsightsOutput } from "@/ai/flows/placement-insights-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { DollarSign, TrendingUp, Building } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const formSchema = z.object({
  role: z.string().min(2, "Job role is required."),
});

const CHART_STYLES = {
  trends: {
    color: "hsl(var(--chart-1))",
  },
  companies: {
    color: "hsl(var(--chart-2))",
  },
  salaries: {
    color: "hsl(var(--chart-3))",
  },
};


const PlacementInsights = () => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<PlacementInsightsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "Data Scientist",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setInsights(null);
    const result = await generatePlacementInsightsAction(values);
    setLoading(false);
    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error Generating Insights",
        description: result.error,
      });
    } else {
      setInsights(result);
    }
  }

  const renderInsights = () => {
    if (!insights) return null;
    
    const trendsChartConfig = {
        hires: { label: "Hires", color: CHART_STYLES.trends.color },
    } satisfies ChartConfig;

    const companiesChartConfig = {
        hires: { label: "Hires", color: CHART_STYLES.companies.color },
    } satisfies ChartConfig;
    
    const salaryChartConfig = {
        averageSalary: { label: "Average Salary (USD)", color: CHART_STYLES.salaries.color },
    } satisfies ChartConfig;

    return (
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Market Summary</CardTitle>
                <CardDescription>Key takeaways for the {form.getValues("role")} role.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-foreground/90">{insights.summary}</p>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Hiring Trends (Last 6 Months)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={trendsChartConfig} className="h-[250px] w-full">
                        <LineChart data={insights.trends} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line type="monotone" dataKey="hires" stroke={CHART_STYLES.trends.color} strokeWidth={2} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Top Hiring Companies
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={companiesChartConfig} className="h-[250px] w-full">
                         <BarChart data={insights.topCompanies} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 12}} />
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                            <Bar dataKey="hires" fill={CHART_STYLES.companies.color} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Average Salary by Skill
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={salaryChartConfig} className="h-[300px] w-full">
                    <BarChart data={insights.averageSalaries} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="skill" />
                        <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                        <Tooltip
                            cursor={{fill: 'hsl(var(--muted))'}}
                            content={<ChartTooltipContent formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number)} />}
                        />
                        <Legend />
                        <Bar dataKey="averageSalary" fill={CHART_STYLES.salaries.color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Button onClick={() => setInsights(null)} variant="outline" className="w-full">Analyze Another Role</Button>
      </div>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Placement Insights Dashboard</CardTitle>
        <CardDescription>Get AI-powered market analysis on job trends, top companies, and salaries.</CardDescription>
      </CardHeader>
      <CardContent>
        {!loading && !insights && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Job Role or Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Software Engineer, Product Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">Generate Insights</Button>
            </form>
          </Form>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 h-64">
            <LoadingSpinner className="h-12 w-12 text-primary" />
            <p className="text-muted-foreground animate-pulse">Our AI is analyzing the job market...</p>
          </div>
        )}
        {renderInsights()}
      </CardContent>
    </Card>
  );
};

export default PlacementInsights;
