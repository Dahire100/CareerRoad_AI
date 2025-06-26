"use client";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { useState } from "react";

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');

  if (!user) {
    return null;
  }

  const handleUpdate = () => {
    updateUser({ name });
    toast({
      title: "Success!",
      description: "Your profile has been updated.",
    });
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Your Profile</CardTitle>
        <CardDescription>Manage your account information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://placehold.co/100x100.png" alt={user.name} data-ai-hint="user avatar" />
            <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
             <h2 className="text-2xl font-bold font-headline">{user.name}</h2>
             <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user.email} readOnly />
            </div>
             <div className="flex items-center gap-2 pt-2">
              <Button onClick={handleUpdate}>Update Profile</Button>
              <Button variant="destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePage;
