import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Loader2,
  Save,
  X,
  CheckCircle2,
  Upload,
  Trash2,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpeakerProfile {
  id: string;
  name: string;
  title: string;
  category: string;
  location: string;
  bio: string | null;
  price_min: number | null;
  price_max: number | null;
  is_verified: boolean | null;
  is_instant_book: boolean | null;
  rating: number | null;
  review_count: number | null;
  total_events: number | null;
  experience_years: number | null;
  languages: string[] | null;
  topics: string[] | null;
  tags: string[] | null;
  image_url: string | null;
}

interface SpeakerProfileEditorProps {
  profile: SpeakerProfile;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES = [
  "Motivational",
  "Business",
  "Technology",
  "Leadership",
  "Health & Wellness",
  "Education",
  "Finance",
  "Entertainment",
  "Sports",
  "Spirituality",
  "Marketing",
  "Sales",
  "Human Resources",
  "Other",
];

const INDIAN_CITIES = [
  "Mumbai, Maharashtra",
  "Delhi, NCR",
  "Bangalore, Karnataka",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Lucknow, Uttar Pradesh",
  "Chandigarh, Punjab",
  "Kochi, Kerala",
  "Goa",
  "Indore, Madhya Pradesh",
  "Coimbatore, Tamil Nadu",
  "Other",
];

const COMMON_LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
];

const SpeakerProfileEditor = ({ profile, onClose, onSave }: SpeakerProfileEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(profile.image_url);
  
  const [form, setForm] = useState({
    name: profile.name || "",
    title: profile.title || "",
    category: profile.category || "",
    location: profile.location || "",
    bio: profile.bio || "",
    price_min: profile.price_min || 10000,
    price_max: profile.price_max || 50000,
    experience_years: profile.experience_years || 1,
    is_instant_book: profile.is_instant_book || false,
    languages: profile.languages || ["English"],
    topics: profile.topics || [],
    tags: profile.tags || [],
  });

  const [newTopic, setNewTopic] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("speaker-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("speaker-images")
        .getPublicUrl(fileName);

      // Update speaker profile with new image URL
      const { error: updateError } = await supabase
        .from("speakers")
        .update({ image_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setImagePreview(publicUrl);
      toast({
        title: "Photo uploaded!",
        description: "Your profile photo has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const { error } = await supabase
        .from("speakers")
        .update({ image_url: null })
        .eq("id", profile.id);

      if (error) throw error;

      setImagePreview(null);
      toast({
        title: "Photo removed",
        description: "Your profile photo has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addItem = (field: "topics" | "tags" | "languages", value: string) => {
    if (!value.trim()) return;
    if (form[field].includes(value.trim())) return;
    
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
    
    if (field === "topics") setNewTopic("");
    if (field === "tags") setNewTag("");
    if (field === "languages") setNewLanguage("");
  };

  const removeItem = (field: "topics" | "tags" | "languages", index: number) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.title || !form.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in your name, title, and category.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("speakers")
        .update({
          name: form.name,
          title: form.title,
          category: form.category,
          location: form.location,
          bio: form.bio,
          price_min: form.price_min,
          price_max: form.price_max,
          experience_years: form.experience_years,
          is_instant_book: form.is_instant_book,
          languages: form.languages,
          topics: form.topics,
          tags: form.tags,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 mb-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Edit Your Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your profile to attract more organizers
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Photo Upload Section */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 pb-8 border-b border-border">
        <div className="relative group">
          <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-10 h-10 text-primary/50" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="font-medium text-foreground">Profile Photo</h3>
          <p className="text-sm text-muted-foreground">
            Upload a professional photo. JPG or PNG, max 5MB.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4" />
              {imagePreview ? "Change Photo" : "Upload Photo"}
            </Button>
            {imagePreview && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={handleRemoveImage}
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </Button>
            )}
          </div>
          {profile.is_verified && (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Verified Speaker</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Professional Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Motivational Speaker & Author"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={form.location}
              onValueChange={(value) => setForm(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              value={form.experience_years}
              onChange={(e) => setForm(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
              min={0}
              max={50}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_min">Min Price (₹)</Label>
              <Input
                id="price_min"
                type="number"
                value={form.price_min}
                onChange={(e) => setForm(prev => ({ ...prev, price_min: parseInt(e.target.value) || 0 }))}
                min={0}
                step={1000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_max">Max Price (₹)</Label>
              <Input
                id="price_max"
                type="number"
                value={form.price_max}
                onChange={(e) => setForm(prev => ({ ...prev, price_max: parseInt(e.target.value) || 0 }))}
                min={0}
                step={1000}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium text-foreground">Instant Booking</p>
              <p className="text-sm text-muted-foreground">
                Allow organizers to book without approval
              </p>
            </div>
            <Switch
              checked={form.is_instant_book}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_instant_book: checked }))}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio / About</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell organizers about yourself, your expertise, speaking style, and what makes you unique..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {form.bio.length}/500 characters
            </p>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label>Languages</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.languages.map((lang, index) => (
                <Badge key={index} variant="secondary" className="gap-1 pr-1">
                  {lang}
                  <button
                    onClick={() => removeItem("languages", index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select
                value={newLanguage}
                onValueChange={(value) => addItem("languages", value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add a language" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_LANGUAGES.filter(l => !form.languages.includes(l)).map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-2">
            <Label>Topics / Expertise</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.topics.map((topic, index) => (
                <Badge key={index} variant="category" className="gap-1 pr-1">
                  {topic}
                  <button
                    onClick={() => removeItem("topics", index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g., Leadership, Team Building"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("topics", newTopic))}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addItem("topics", newTopic)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags / Keywords</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="gap-1 pr-1">
                  {tag}
                  <button
                    onClick={() => removeItem("tags", index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g., TED Speaker, Best-Selling Author"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("tags", newTag))}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addItem("tags", newTag)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="hero" onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default SpeakerProfileEditor;
