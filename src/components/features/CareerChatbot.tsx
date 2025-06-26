"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getChatbotResponseAction } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Bot, User, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const formSchema = z.object({
  question: z.string().min(1, "Message cannot be empty."),
});

type Message = {
  role: "user" | "bot";
  content: string;
};

const CareerChatbot = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const userMessage: Message = { role: "user", content: values.question };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    const result = await getChatbotResponseAction({ question: values.question });
    
    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
      setMessages(prev => prev.slice(0, -1));
    } else {
      const botMessage: Message = { role: "bot", content: result.advice };
      setMessages(prev => [...prev, botMessage]);
    }
    setLoading(false);
  }
  
  return (
    <Card className="max-w-4xl mx-auto w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">AI Career Chatbot</CardTitle>
        <CardDescription>Ask me anything about your career, from interview tips to salary negotiations.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[60vh]">
        <ScrollArea className="flex-grow mb-4 pr-4" viewportRef={scrollAreaViewportRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <Bot className="h-16 w-16 mb-4 text-primary/50"/>
                    <p className="text-lg font-medium">I'm ready to help.</p>
                    <p>What's on your mind?</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={cn("flex items-start gap-3 animate-in fade-in-25 duration-300", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role === 'bot' && (
                  <Avatar className="bg-primary text-primary-foreground">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("max-w-[85%] rounded-lg px-4 py-3 text-sm shadow-sm", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card")}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                 {message.role === 'user' && (
                  <Avatar className="bg-accent text-accent-foreground">
                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
                <div className="flex items-start gap-3 justify-start animate-in fade-in-25 duration-300">
                     <Avatar className="bg-primary text-primary-foreground">
                        <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                     <div className="bg-card rounded-lg px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
                        <LoadingSpinner className="h-4 w-4"/>
                        <span className="text-muted-foreground">Thinking...</span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="mt-auto pt-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Textarea
                        placeholder="e.g., How should I prepare for a software engineer interview?"
                        {...field}
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                            }
                        }}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={loading}>
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerChatbot;
