import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Demo accounts to create
    const demoAccounts = [
      {
        email: "admin@bookyourguests.in",
        password: "Admin@bookyourguests2025",
        fullName: "Admin User",
        role: "admin" as const,
      },
      {
        email: "speaker@demo.bookyourguests.in",
        password: "Demo@Speaker123",
        fullName: "Rahul Sharma",
        role: "speaker" as const,
        speakerData: {
          title: "Motivational Speaker & Life Coach",
          category: "Motivational",
          location: "Mumbai, India",
          bio: "Award-winning motivational speaker with 10+ years of experience inspiring audiences across India. Specializing in leadership, personal growth, and team motivation.",
          price_min: 50000,
          price_max: 150000,
          experience_years: 10,
          total_events: 250,
          rating: 4.9,
          review_count: 127,
          is_verified: true,
          is_instant_book: true,
          languages: ["English", "Hindi", "Marathi"],
          topics: ["Leadership", "Personal Growth", "Team Building", "Success Mindset", "Career Development"],
          tags: ["Motivational", "Corporate", "College", "Keynote"],
          approval_status: "approved",
          base_district: "Mumbai",
          travel_charge: 5000,
          accommodation_charge: 3000,
        }
      },
      {
        email: "organizer@demo.bookyourguests.in",
        password: "Demo@Organizer123",
        fullName: "Priya Menon",
        role: "organizer" as const,
      }
    ];

    // Additional sample speakers
    const sampleSpeakers = [
      {
        name: "Vikram Patel",
        title: "Stand-Up Comedian & Event Host",
        category: "Comedy",
        location: "Delhi NCR",
        bio: "One of India's funniest stand-up comedians with Netflix specials and sold-out shows nationwide.",
        price_min: 75000,
        price_max: 200000,
        experience_years: 8,
        total_events: 500,
        rating: 4.8,
        review_count: 89,
        is_verified: true,
        is_instant_book: false,
        languages: ["English", "Hindi"],
        topics: ["Corporate Comedy", "Stand-Up", "Event Hosting", "Roasts"],
        tags: ["Comedy", "Entertainment", "Corporate Events"],
      },
      {
        name: "Dr. Ananya Krishnan",
        title: "Technology Evangelist & AI Expert",
        category: "Technology",
        location: "Bangalore",
        bio: "Former Google engineer turned tech evangelist. Expert in AI, Machine Learning, and digital transformation.",
        price_min: 100000,
        price_max: 300000,
        experience_years: 15,
        total_events: 180,
        rating: 4.9,
        review_count: 65,
        is_verified: true,
        is_instant_book: true,
        languages: ["English", "Tamil", "Hindi"],
        topics: ["Artificial Intelligence", "Machine Learning", "Digital Transformation", "Future of Work"],
        tags: ["Technology", "AI", "Innovation", "Keynote"],
      },
      {
        name: "Sanjay Gupta",
        title: "Business Strategist & Startup Mentor",
        category: "Business",
        location: "Mumbai",
        bio: "Serial entrepreneur and angel investor. Has mentored 100+ startups and spoken at major business conferences.",
        price_min: 80000,
        price_max: 250000,
        experience_years: 20,
        total_events: 300,
        rating: 4.7,
        review_count: 156,
        is_verified: true,
        is_instant_book: false,
        languages: ["English", "Hindi", "Gujarati"],
        topics: ["Entrepreneurship", "Business Strategy", "Startup Growth", "Investment"],
        tags: ["Business", "Startup", "Corporate", "Mentorship"],
      },
      {
        name: "Meera Srinivasan",
        title: "Education Innovator & TEDx Speaker",
        category: "Education",
        location: "Chennai",
        bio: "Award-winning educator revolutionizing learning methods. TEDx speaker with 2M+ views.",
        price_min: 40000,
        price_max: 100000,
        experience_years: 12,
        total_events: 200,
        rating: 4.8,
        review_count: 92,
        is_verified: true,
        is_instant_book: true,
        languages: ["English", "Tamil"],
        topics: ["Education Innovation", "Student Motivation", "Teaching Methods", "Career Guidance"],
        tags: ["Education", "College", "TEDx", "Youth"],
      },
      {
        name: "Arjun Kapoor",
        title: "Celebrity Host & Entertainment Anchor",
        category: "Entertainment",
        location: "Mumbai",
        bio: "Popular TV host and entertainment anchor. Has hosted major award shows and corporate galas.",
        price_min: 150000,
        price_max: 500000,
        experience_years: 15,
        total_events: 400,
        rating: 4.6,
        review_count: 78,
        is_verified: true,
        is_instant_book: false,
        languages: ["English", "Hindi"],
        topics: ["Event Hosting", "Award Shows", "Corporate Events", "Entertainment"],
        tags: ["Entertainment", "Hosting", "Celebrity", "Events"],
      },
    ];

    const results: any[] = [];

    // Create demo user accounts
    for (const account of demoAccounts) {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === account.email);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        results.push({ email: account.email, status: "already exists", userId });
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: { full_name: account.fullName }
        });

        if (authError) {
          results.push({ email: account.email, status: "auth error", error: authError.message });
          continue;
        }

        userId = authData.user.id;

        // Create profile
        await supabase.from("profiles").insert({
          user_id: userId,
          full_name: account.fullName,
          approval_status: "approved",
        });

        // Create role
        await supabase.from("user_roles").insert({
          user_id: userId,
          role: account.role,
        });

        results.push({ email: account.email, status: "created", userId });
      }

      // If speaker, create/update speaker profile
      if (account.role === "speaker" && account.speakerData) {
        const { data: existingSpeaker } = await supabase
          .from("speakers")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        let speakerId: string;

        if (existingSpeaker) {
          speakerId = existingSpeaker.id;
          // Update speaker data
          await supabase
            .from("speakers")
            .update({
              name: account.fullName,
              ...account.speakerData,
            })
            .eq("id", speakerId);
        } else {
          // Create speaker profile
          const { data: newSpeaker } = await supabase
            .from("speakers")
            .insert({
              user_id: userId,
              name: account.fullName,
              ...account.speakerData,
            })
            .select()
            .single();

          speakerId = newSpeaker?.id;
        }

        // Generate sample availability for this speaker
        if (speakerId) {
          // Delete old availability
          await supabase
            .from("speaker_availability")
            .delete()
            .eq("speaker_id", speakerId);

          // Generate new availability for next 14 days
          const availabilitySlots = [];
          const today = new Date();
          
          for (let i = 1; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Add 3 slots per day
            const slots = [
              { start: "09:00", end: "10:00" },
              { start: "10:00", end: "11:00" },
              { start: "14:00", end: "15:00" },
            ];
            
            for (const slot of slots) {
              availabilitySlots.push({
                speaker_id: speakerId,
                date: dateStr,
                start_time: slot.start,
                end_time: slot.end,
                status: Math.random() > 0.7 ? "booked" : "available",
              });
            }
          }
          
          await supabase.from("speaker_availability").insert(availabilitySlots);
        }
      }
    }

    // Create sample speakers (without real user accounts - just profiles for browsing)
    for (const speakerData of sampleSpeakers) {
      // Check if speaker with this name already exists
      const { data: existing } = await supabase
        .from("speakers")
        .select("id")
        .eq("name", speakerData.name)
        .maybeSingle();

      if (!existing) {
        // Create a placeholder user for this speaker
        const placeholderEmail = `${speakerData.name.toLowerCase().replace(/\s+/g, '.')}@placeholder.bookmyguest.com`;
        
        const { data: authData } = await supabase.auth.admin.createUser({
          email: placeholderEmail,
          password: "Placeholder@123456",
          email_confirm: true,
          user_metadata: { full_name: speakerData.name }
        });

        if (authData?.user) {
          await supabase.from("profiles").insert({
            user_id: authData.user.id,
            full_name: speakerData.name,
          });

          await supabase.from("user_roles").insert({
            user_id: authData.user.id,
            role: "speaker",
          });

          const { name: speakerName, ...restSpeakerData } = speakerData;
          const { data: newSpeaker } = await supabase
            .from("speakers")
            .insert({
              user_id: authData.user.id,
              name: speakerName,
              ...restSpeakerData,
            })
            .select()
            .single();

          // Generate availability
          if (newSpeaker) {
            const availabilitySlots = [];
            const today = new Date();
            
            for (let i = 1; i <= 14; i++) {
              const date = new Date(today);
              date.setDate(date.getDate() + i);
              const dateStr = date.toISOString().split('T')[0];
              
              const slots = [
                { start: "09:00", end: "10:00" },
                { start: "11:00", end: "12:00" },
                { start: "15:00", end: "16:00" },
              ];
              
              for (const slot of slots) {
                availabilitySlots.push({
                  speaker_id: newSpeaker.id,
                  date: dateStr,
                  start_time: slot.start,
                  end_time: slot.end,
                  status: Math.random() > 0.6 ? "booked" : "available",
                });
              }
            }
            
            await supabase.from("speaker_availability").insert(availabilitySlots);
          }

          results.push({ speaker: speakerData.name, status: "created" });
        }
      } else {
        results.push({ speaker: speakerData.name, status: "already exists" });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Demo data seeded successfully",
      results,
      demoCredentials: {
        admin: {
          email: "admin@bookyourguests.in",
          password: "Admin@bookyourguests2025",
        },
        speaker: {
          email: "speaker@demo.bookyourguests.in",
          password: "Demo@Speaker123",
        },
        organizer: {
          email: "organizer@demo.bookyourguests.in",
          password: "Demo@Organizer123",
        }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    console.error("Error seeding demo data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
