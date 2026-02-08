import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, content, sparkType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = `You are CIM Spark, a creative brainstorming assistant for content creators. 
You help generate ideas, hooks, outlines, and variations for content pieces.
Be creative, concise, and actionable. Format your responses in a clear, easy-to-read way.`;

    let userPrompt = "";

    switch (sparkType) {
      case "hooks":
        userPrompt = `Based on this content idea, generate 3 compelling hooks that could capture audience attention:

Title: ${title}
${description ? `Description: ${description}` : ""}
${content ? `Notes: ${content}` : ""}

Generate 3 different hooks (opening lines or angles) that could make this content irresistible. Each hook should be different in style - one emotional, one curiosity-driven, one value-focused.`;
        break;
        
      case "outline":
        userPrompt = `Create a brief content outline for this idea:

Title: ${title}
${description ? `Description: ${description}` : ""}
${content ? `Notes: ${content}` : ""}

Generate a structured outline with:
- Hook/Opening
- 3-5 main points or sections
- Call-to-action/Conclusion

Keep it concise but actionable.`;
        break;
        
      case "titles":
        userPrompt = `Generate 5 title variations for this content idea:

Current Title: ${title}
${description ? `Description: ${description}` : ""}
${content ? `Notes: ${content}` : ""}

Create 5 alternative titles with different approaches:
1. Curiosity-driven
2. Benefit-focused
3. How-to style
4. Number/List-based
5. Emotional/Story-based`;
        break;
        
      default:
        userPrompt = `Brainstorm ideas for this content:

Title: ${title}
${description ? `Description: ${description}` : ""}
${content ? `Notes: ${content}` : ""}

Provide creative suggestions to develop this idea further.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue using CIM Spark." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate suggestions");
    }

    const data = await response.json();
    const content_response = data.choices?.[0]?.message?.content || "No suggestions generated.";

    return new Response(
      JSON.stringify({ suggestions: content_response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("CIM Spark error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
