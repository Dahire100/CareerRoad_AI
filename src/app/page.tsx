import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bot, CheckSquare, FileText, LineChart, Route, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';

const features = [
  {
    title: 'AI-Powered Career Roadmap',
    description: 'Get a personalized 6-month plan to guide your career growth, tailored to your skills and interests.',
    icon: <Route className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Intelligent Resume Feedback',
    description: 'Receive detailed, section-by-section feedback to optimize your resume for ATS and human recruiters.',
    icon: <FileText className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Smart Job Matcher',
    description: 'Upload your resume and paste a job description to see how well you match, with an actionable score.',
    icon: <Sparkles className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Career Chatbot',
    description: 'Ask anything about your career, from interview tips to salary negotiations, and get instant AI-powered advice.',
    icon: <Bot className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Learning Tracker',
    description: 'Mark your roadmap steps as complete and visualize your progress with calendars, streaks, and progress bars.',
    icon: <CheckSquare className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Placement Insights',
    description: 'Get real-time market analysis on job trends, top hiring companies, and average salaries for any role.',
    icon: <LineChart className="h-8 w-8 text-primary" />,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight text-primary">
              Navigate Your Career with AI
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              CareerRoad AI provides the tools and insights you need to build a successful career path, from personalized roadmaps to job market analysis.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="font-semibold text-lg">
                <Link href="/login">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">All The Tools You Need</h2>
              <p className="mt-2 text-lg text-muted-foreground">
                One platform to guide you from learning to landing your dream job.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex flex-row items-center gap-4">
                      {feature.icon}
                      <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-4 text-center text-muted-foreground text-sm">
        <p>&copy; 2025 CareerRoad AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
