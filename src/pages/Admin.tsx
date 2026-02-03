import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Users,
  Mic2,
  Calendar,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  Eye,
  Clock,
  MapPin,
  IndianRupee,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Speaker {
  id: string;
  user_id: string;
  name: string;
  title: string;
  category: string;
  location: string;
  bio: string | null;
  price_min: number | null;
  price_max: number | null;
  is_verified: boolean | null;
  approval_status: string | null;
  image_url: string | null;
  created_at: string;
  base_district: string | null;
  travel_charge: number | null;
  accommodation_charge: number | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  approval_status: string | null;
  created_at: string;
  role?: string;
}

interface Booking {
  id: string;
  event_name: string;
  status: string | null;
  created_at: string;
  speakers: { name: string };
  speaker_availability: { date: string };
}

const Admin = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [stats, setStats] = useState({
    totalSpeakers: 0,
    pendingSpeakers: 0,
    totalUsers: 0,
    pendingUsers: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    checkAdminAndFetch();
  }, [user]);

  const checkAdminAndFetch = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      // Check if user is admin
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
        toast({
          title: "Error",
          description: "Failed to verify admin privileges.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      if (roleData?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchAllData();
    } catch (err) {
      console.error("Admin check error:", err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    // Fetch speakers
    const { data: speakersData } = await supabase
      .from("speakers")
      .select("*")
      .order("created_at", { ascending: false });

    if (speakersData) {
      setSpeakers(speakersData as Speaker[]);
      setStats((s) => ({
        ...s,
        totalSpeakers: speakersData.length,
        pendingSpeakers: speakersData.filter((sp) => sp.approval_status === "pending").length,
      }));
    }

    // Fetch profiles with roles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: rolesData } = await supabase.from("user_roles").select("*");

    if (profilesData && rolesData) {
      const usersWithRoles = profilesData.map((p) => ({
        ...p,
        role: rolesData.find((r) => r.user_id === p.user_id)?.role || "organizer",
      }));
      setUsers(usersWithRoles as UserProfile[]);
      setStats((s) => ({
        ...s,
        totalUsers: profilesData.length,
        pendingUsers: profilesData.filter((p) => p.approval_status === "pending").length,
      }));
    }

    // Fetch bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`*, speakers (name), speaker_availability (date)`)
      .order("created_at", { ascending: false });

    if (bookingsData) {
      setBookings(bookingsData as unknown as Booking[]);
      setStats((s) => ({ ...s, totalBookings: bookingsData.length }));
    }
  };

  const handleApproval = async (
    type: "speaker" | "user",
    id: string,
    userId: string,
    status: "approved" | "rejected"
  ) => {
    const table = type === "speaker" ? "speakers" : "profiles";
    const idField = type === "speaker" ? "id" : "user_id";

    const { error } = await supabase
      .from(table)
      .update({ approval_status: status })
      .eq(idField, type === "speaker" ? id : userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: status === "approved" ? "Approved!" : "Rejected",
        description: `${type === "speaker" ? "Speaker" : "User"} has been ${status}.`,
      });
      fetchAllData();
    }
  };

  const handleDeleteSpeaker = async (speakerId: string, userId: string) => {
    // Delete speaker profile
    const { error: speakerError } = await supabase.from("speakers").delete().eq("id", speakerId);

    if (speakerError) {
      toast({ title: "Error", description: speakerError.message, variant: "destructive" });
      return;
    }

    // Delete user role
    await supabase.from("user_roles").delete().eq("user_id", userId);

    toast({ title: "Deleted", description: "Speaker account has been deleted." });
    fetchAllData();
  };

  const handleDeleteUser = async (userId: string) => {
    // Delete profile
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Delete user role
    await supabase.from("user_roles").delete().eq("user_id", userId);

    toast({ title: "Deleted", description: "User account has been deleted." });
    fetchAllData();
  };

  const handleUpdateSpeaker = async (speaker: Speaker) => {
    const { error } = await supabase
      .from("speakers")
      .update({
        name: speaker.name,
        title: speaker.title,
        category: speaker.category,
        location: speaker.location,
        bio: speaker.bio,
        price_min: speaker.price_min,
        price_max: speaker.price_max,
        is_verified: speaker.is_verified,
        base_district: speaker.base_district,
        travel_charge: speaker.travel_charge,
        accommodation_charge: speaker.accommodation_charge,
      })
      .eq("id", speaker.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: "Speaker profile updated successfully." });
      setEditingSpeaker(null);
      fetchAllData();
    }
  };

  const filteredSpeakers = speakers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="pt-24 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-muted/30">
        <div className="container-tight py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage speakers, users, and bookings</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Mic2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSpeakers}</p>
                  <p className="text-xs text-muted-foreground">Speakers</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingSpeakers}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingUsers}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  <p className="text-xs text-muted-foreground">Bookings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search speakers, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="speakers">
            <TabsList className="mb-6">
              <TabsTrigger value="speakers" className="gap-2">
                <Mic2 className="w-4 h-4" /> Speakers
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" /> Users
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="w-4 h-4" /> Bookings
              </TabsTrigger>
            </TabsList>

            {/* Speakers Tab */}
            <TabsContent value="speakers">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-medium text-sm">Speaker</th>
                        <th className="text-left p-4 font-medium text-sm">Category</th>
                        <th className="text-left p-4 font-medium text-sm">Location</th>
                        <th className="text-left p-4 font-medium text-sm">Pricing</th>
                        <th className="text-left p-4 font-medium text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSpeakers.map((speaker) => (
                        <tr key={speaker.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                {speaker.image_url ? (
                                  <img src={speaker.image_url} alt={speaker.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-bold text-primary">{speaker.name.charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium flex items-center gap-1">
                                  {speaker.name}
                                  {speaker.is_verified && <CheckCircle2 className="w-4 h-4 text-success" />}
                                </p>
                                <p className="text-xs text-muted-foreground">{speaker.title}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="category">{speaker.category}</Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {speaker.location}
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" />
                              {speaker.price_min && speaker.price_max
                                ? `${(speaker.price_min / 1000).toFixed(0)}k - ${(speaker.price_max / 1000).toFixed(0)}k`
                                : "Not set"}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                speaker.approval_status === "approved"
                                  ? "verified"
                                  : speaker.approval_status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {speaker.approval_status || "pending"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {speaker.approval_status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-success hover:text-success"
                                    onClick={() => handleApproval("speaker", speaker.id, speaker.user_id, "approved")}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleApproval("speaker", speaker.id, speaker.user_id, "rejected")}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingSpeaker(speaker)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/speaker/${speaker.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Speaker</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {speaker.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground"
                                      onClick={() => handleDeleteSpeaker(speaker.id, speaker.user_id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-medium text-sm">User</th>
                        <th className="text-left p-4 font-medium text-sm">Role</th>
                        <th className="text-left p-4 font-medium text-sm">Joined</th>
                        <th className="text-left p-4 font-medium text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((profile) => (
                        <tr key={profile.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="font-bold text-primary">
                                  {profile.full_name?.charAt(0) || "U"}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{profile.full_name || "Unknown"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={profile.role === "admin" ? "default" : "outline"}>
                              {profile.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {format(new Date(profile.created_at), "MMM d, yyyy")}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                profile.approval_status === "approved"
                                  ? "verified"
                                  : profile.approval_status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {profile.approval_status || "pending"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {profile.approval_status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-success hover:text-success"
                                    onClick={() => handleApproval("user", profile.id, profile.user_id, "approved")}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleApproval("user", profile.id, profile.user_id, "rejected")}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {profile.role !== "admin" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this user? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground"
                                        onClick={() => handleDeleteUser(profile.user_id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-medium text-sm">Event</th>
                        <th className="text-left p-4 font-medium text-sm">Speaker</th>
                        <th className="text-left p-4 font-medium text-sm">Date</th>
                        <th className="text-left p-4 font-medium text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-4 font-medium">{booking.event_name}</td>
                          <td className="p-4 text-muted-foreground">{booking.speakers?.name}</td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {booking.speaker_availability?.date
                              ? format(new Date(booking.speaker_availability.date), "MMM d, yyyy")
                              : "N/A"}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                booking.status === "confirmed" ? "verified" : "secondary"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Speaker Dialog */}
      <Dialog open={!!editingSpeaker} onOpenChange={() => setEditingSpeaker(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Speaker Profile</DialogTitle>
          </DialogHeader>
          {editingSpeaker && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingSpeaker.name}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingSpeaker.title}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, title: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={editingSpeaker.category}
                    onValueChange={(value) => setEditingSpeaker({ ...editingSpeaker, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Motivational">Motivational</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Comedy">Comedy</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={editingSpeaker.location}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, location: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea
                  value={editingSpeaker.bio || ""}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, bio: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Price (₹)</Label>
                  <Input
                    type="number"
                    value={editingSpeaker.price_min || ""}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, price_min: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Max Price (₹)</Label>
                  <Input
                    type="number"
                    value={editingSpeaker.price_max || ""}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, price_max: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base District</Label>
                  <Input
                    placeholder="e.g., Chennai"
                    value={editingSpeaker.base_district || ""}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, base_district: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Verified</Label>
                  <Select
                    value={editingSpeaker.is_verified ? "yes" : "no"}
                    onValueChange={(value) => setEditingSpeaker({ ...editingSpeaker, is_verified: value === "yes" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Travel Charge (₹)</Label>
                  <Input
                    type="number"
                    placeholder="For out-of-district events"
                    value={editingSpeaker.travel_charge || ""}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, travel_charge: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Accommodation Charge (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Per night"
                    value={editingSpeaker.accommodation_charge || ""}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, accommodation_charge: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingSpeaker(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateSpeaker(editingSpeaker)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
