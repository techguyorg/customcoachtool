import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, Scale, Target, Heart, Utensils, Save, Loader2, Camera, X, Bell
} from "lucide-react";
import { ChangePasswordCard } from "@/components/shared/ChangePasswordCard";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const FITNESS_GOALS = [
  "Weight Loss",
  "Muscle Building", 
  "Strength Training",
  "Improve Endurance",
  "Flexibility & Mobility",
  "General Fitness",
  "Sports Performance",
  "Rehabilitation",
  "Body Recomposition",
  "Maintain Current Fitness",
];

const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Halal",
  "Kosher",
];

export default function ClientProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["client-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [profileRes, clientRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("client_profiles").select("*").eq("user_id", user.id).single(),
      ]);

      return {
        profile: profileRes.data,
        clientProfile: clientRes.data as {
          height_cm?: number;
          current_weight_kg?: number;
          target_weight_kg?: number;
          fitness_level?: string;
          fitness_goals?: string[];
          dietary_restrictions?: string[];
          medical_conditions?: string;
          email_checkin_submitted?: boolean;
          email_checkin_reviewed?: boolean;
          email_plan_assigned?: boolean;
        } | null,
      };
    },
    enabled: !!user?.id,
  });

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  
  const [heightCm, setHeightCm] = useState("");
  const [currentWeightKg, setCurrentWeightKg] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [medicalConditions, setMedicalConditions] = useState("");
  
  // Email preferences
  const [emailCheckinReviewed, setEmailCheckinReviewed] = useState(true);
  const [emailPlanAssigned, setEmailPlanAssigned] = useState(true);
  
  const [uploading, setUploading] = useState(false);

  // Load data
  useEffect(() => {
    if (profileData) {
      setFullName(profileData.profile?.full_name || "");
      setPhone(profileData.profile?.phone || "");
      setBio(profileData.profile?.bio || "");
      setAvatarUrl(profileData.profile?.avatar_url || "");
      setDateOfBirth(profileData.profile?.date_of_birth || "");
      setGender(profileData.profile?.gender || "");
      
      setHeightCm(profileData.clientProfile?.height_cm?.toString() || "");
      setCurrentWeightKg(profileData.clientProfile?.current_weight_kg?.toString() || "");
      setTargetWeightKg(profileData.clientProfile?.target_weight_kg?.toString() || "");
      setFitnessLevel(profileData.clientProfile?.fitness_level || "");
      setFitnessGoals(profileData.clientProfile?.fitness_goals || []);
      setDietaryRestrictions(profileData.clientProfile?.dietary_restrictions || []);
      setMedicalConditions(profileData.clientProfile?.medical_conditions || "");
      setEmailCheckinReviewed(profileData.clientProfile?.email_checkin_reviewed ?? true);
      setEmailPlanAssigned(profileData.clientProfile?.email_plan_assigned ?? true);
    }
  }, [profileData]);

  const toggleGoal = (goal: string) => {
    setFitnessGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const toggleDiet = (diet: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          bio,
          avatar_url: avatarUrl || null,
          date_of_birth: dateOfBirth || null,
          gender: gender || null,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Check if client_profile exists
      const { data: existing } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const clientData = {
        height_cm: heightCm ? parseFloat(heightCm) : null,
        current_weight_kg: currentWeightKg ? parseFloat(currentWeightKg) : null,
        target_weight_kg: targetWeightKg ? parseFloat(targetWeightKg) : null,
        fitness_level: fitnessLevel || null,
        fitness_goals: fitnessGoals.length > 0 ? fitnessGoals : null,
        dietary_restrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : null,
        medical_conditions: medicalConditions || null,
        email_checkin_reviewed: emailCheckinReviewed,
        email_plan_assigned: emailPlanAssigned,
      };

      if (existing) {
        const { error } = await supabase
          .from("client_profiles")
          .update(clientData)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("client_profiles")
          .insert({ user_id: user.id, ...clientData });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to save profile");
      console.error(error);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = fullName
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and fitness preferences
        </p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90"
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user?.id) return;
                  
                  setUploading(true);
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                    
                    const { error } = await supabase.storage
                      .from('avatars')
                      .upload(fileName, file, { upsert: true });
                    
                    if (error) throw error;
                    
                    const { data: { publicUrl } } = supabase.storage
                      .from('avatars')
                      .getPublicUrl(fileName);
                    
                    setAvatarUrl(publicUrl);
                    toast.success("Photo uploaded!");
                  } catch (error) {
                    toast.error("Failed to upload photo");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="avatarUrl" className="text-xs">Or paste image URL</Label>
              <Input
                id="avatarUrl"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="mt-1 text-sm h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName" className="text-xs">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 text-sm h-9"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 text-sm h-9"
              />
            </div>
            <div>
              <Label htmlFor="dob" className="text-xs">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 text-sm h-9"
              />
            </div>
            <div>
              <Label htmlFor="gender" className="text-xs">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-xs">About Me</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={2}
              className="mt-1 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Physical Stats */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Physical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="height" className="text-xs">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="mt-1 text-sm h-9"
              />
            </div>
            <div>
              <Label htmlFor="currentWeight" className="text-xs">Current Weight (kg)</Label>
              <Input
                id="currentWeight"
                type="number"
                step="0.1"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(e.target.value)}
                className="mt-1 text-sm h-9"
              />
            </div>
            <div>
              <Label htmlFor="targetWeight" className="text-xs">Target Weight (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                className="mt-1 text-sm h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fitness Goals */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" />
            Fitness Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Your Goals</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {FITNESS_GOALS.map((goal) => (
                <Badge
                  key={goal}
                  variant={fitnessGoals.includes(goal) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleGoal(goal)}
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="fitnessLevel" className="text-xs">Fitness Level</Label>
            <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
              <SelectTrigger className="mt-1 h-9 text-sm">
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Health & Nutrition */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Health & Nutrition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="medical" className="text-xs">Medical Conditions / Injuries</Label>
            <Textarea
              id="medical"
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              placeholder="Any conditions your coach should know about..."
              rows={2}
              className="mt-1 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">Dietary Preferences</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {DIETARY_RESTRICTIONS.map((diet) => (
                <Badge
                  key={diet}
                  variant={dietaryRestrictions.includes(diet) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleDiet(diet)}
                >
                  {diet}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Email Notifications
          </CardTitle>
          <CardDescription className="text-xs">
            Control which emails you receive from CustomCoachPro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Check-in Reviewed</Label>
              <p className="text-xs text-muted-foreground">
                Receive an email when your coach reviews your check-in
              </p>
            </div>
            <Switch 
              checked={emailCheckinReviewed} 
              onCheckedChange={setEmailCheckinReviewed}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Plan Assigned</Label>
              <p className="text-xs text-muted-foreground">
                Receive an email when your coach assigns a new workout or diet plan
              </p>
            </div>
            <Switch 
              checked={emailPlanAssigned} 
              onCheckedChange={setEmailPlanAssigned}
            />
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <ChangePasswordCard />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
