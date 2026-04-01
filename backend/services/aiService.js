// services/aiService.js
// ✅ Fixed: Robust JSON parsing + plain text output + better error handling

const { Mistral } = require('@mistralai/mistralai');

// Initialize Mistral
let mistral = null;
let aiAvailable = false;

if (process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY !== 'your_api_key_here') {
  try {
    mistral = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY
    });
    aiAvailable = true;
  } catch (error) {
    console.error('Mistral init failed:', error.message);
  }
} else {
}

// ✅ Helper: Strip HTML tags from text
const stripHtmlTags = (text) => {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// ✅ Helper: Format plain text for React display
const formatPlainText = (text) => {
  if (!text) return '';
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
};

// ✅ Helper: Clean markdown code blocks
const cleanJsonResponse = (text) => {
  if (!text) return '';
  let cleaned = text.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*/g, '');
  return cleaned.trim();
};

// ✅ Helper: SAFELY parse JSON with fallback for malformed responses
const safeJsonParse = (text, fallback) => {
  try {
    // First, try direct parse
    return JSON.parse(text);
  } catch (e) {
    
    try {
      // Try to extract JSON object from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Escape problematic characters in the matched JSON string
        let escaped = jsonMatch[0]
          .replace(/\\n/g, '\\\\n')      // Escape literal newlines
          .replace(/\\r/g, '\\\\r')      // Escape carriage returns
          .replace(/\t/g, '\\t')         // Escape tabs
          .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control chars
        return JSON.parse(escaped);
      }
    } catch (e2) {
    }
    
    // Return fallback if all parsing fails
    return fallback;
  }
};

// ✅ Mock post function - PLAIN TEXT format
const getMockPost = (title) => {
  const plainContent = `${title} is becoming increasingly popular in Kenya's real estate market. Investors are seeing great returns in this sector.

Why Invest in ${title}
Kenya's growing economy and urbanization make ${title.toLowerCase()} a smart investment choice for 2025. With proper research and guidance, you can build wealth through strategic property investments.

Key Considerations for Kenyan Investors
• Location: Focus on growing areas like Westlands, Kilimani, Ruaka, and emerging suburbs with infrastructure development
• Legal Due Diligence: Verify title deeds, land rates clearance, and work with EAAB-registered agents
• Market Timing: Research rental yields, appreciation trends, and demand drivers in your target area
• Financing Options: Explore mortgage products from Kenyan banks, SACCOs, or developer payment plans

Expert Tips for Success
Start with a clear investment strategy: are you targeting rental income, capital appreciation, or both? Work with reputable professionals who understand local market dynamics.

Conclusion
${title} offers excellent opportunities in Kenya's dynamic real estate market. With proper planning, research, and expert guidance, you can successfully navigate this exciting investment journey.

Ready to explore your options? Contact RentWise Properties to discover verified properties that match your investment goals.`;

  return {
    success: true,
    content: plainContent,
    excerpt: `Discover everything about ${title.toLowerCase()} in Kenya's growing real estate market. Expert insights for smart investors.`
  };
};

// Mock ideas function
const getMockIdeas = (topic) => ({
  success: true,
  ideas: [
    `${topic}: Complete Guide for Kenyan Investors`,
    `Top 5 ${topic} Trends in Nairobi 2025`,
    `How to Invest in ${topic} on a Budget`,
    `${topic} Success Stories from Kenya`,
    `The Future of ${topic} in Kenya`
  ]
});

/**
 * Generate blog post ideas
 */
const generateBlogIdeas = async (topic) => {
  try {
    
    if (aiAvailable && mistral) {
      try {
        const response = await mistral.chat.complete({
          model: 'mistral-small-latest',
          messages: [
            { 
              role: 'user', 
              content: `Generate 5 blog post titles about real estate in Kenya related to "${topic}". 
Return ONLY a numbered list. Format exactly like this:
1. First title here
2. Second title here
3. Third title here
4. Fourth title here
5. Fifth title here
Do not include any other text, explanations, markdown, or formatting.` 
            }
          ],
          maxTokens: 250
        });
        
        const text = response.choices?.[0]?.message?.content || '';
        
        const ideas = text.split('\n')
          .filter(line => line.match(/^\d+\./))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(idea => idea.length > 10 && idea.length < 200);
        
        
        if (ideas.length >= 3) {
          return { success: true, ideas: ideas.slice(0, 5) };
        } else {
        }
      } catch (apiError) {
        console.error('Mistral API error for ideas:', apiError.message);
      }
    }
    
    return getMockIdeas(topic);
  } catch (error) {
    console.error('Generate ideas error:', error);
    return getMockIdeas(topic);
  }
};

/**
 * Write complete blog post - FIXED JSON PARSING
 */
const writeBlogPost = async (title, category, keywords = []) => {
  try {
    
    if (aiAvailable && mistral) {
      // ✅ Prompt with stricter JSON instructions
      const prompt = `You are writing a blog post for a Kenyan real estate website.

Title: "${title}"
Category: ${category}
Keywords: ${keywords.join(', ')}

⚠️ CRITICAL OUTPUT RULES:
1. Return ONLY valid JSON. Nothing else. No markdown, no explanations, no code blocks.
2. Use PLAIN TEXT only - NO HTML tags (<p>, <h2>, <ul>, <li>, <strong>, etc.)
3. Use \\n for new paragraphs, • for bullet points.
4. Escape all quotes, newlines, and special characters properly for JSON.
5. Keep excerpt under 150 characters.

Required JSON format:
{
  "excerpt": "One sentence summary here",
  "content": "Plain text content. Use \\n for paragraphs. Use • for bullets. NO HTML."
}

Content structure:
- Engaging introduction
- 3 sections with bold headings using **text**
- Practical tips as bullet points with •
- Conclusion with call-to-action
- 400-600 words total
- Written for Kenyan real estate investors`;

      try {
        const response = await mistral.chat.complete({
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 2500,
          // ✅ Force JSON output if supported
          response_format: { type: "json_object" }
        });
        
        let rawText = response.choices?.[0]?.message?.content || '';
        
        // Clean markdown wrappers
        const cleanedText = cleanJsonResponse(rawText);
        
        // ✅ Use safe JSON parser with fallback
        const fallback = {
          excerpt: `Expert insights on ${title.toLowerCase()} in Kenya.`,
          content: `${title} is a growing opportunity in Kenya's real estate market.

Key Points:
• Research locations like Westlands, Kilimani, and emerging areas
• Work with EAAB-registered agents for legal compliance
• Consider rental yields and long-term appreciation
• Explore financing options from Kenyan banks and SACCOs

Conclusion: With proper planning, ${title.toLowerCase()} can generate strong returns for Kenyan investors.`
        };
        
        const result = safeJsonParse(cleanedText, fallback);
        
        // Strip any HTML that might have slipped through
        const cleanContent = stripHtmlTags(result.content || fallback.content);
        const cleanExcerpt = stripHtmlTags(result.excerpt || fallback.excerpt);
        
        return { 
          success: true, 
          content: cleanContent,
          excerpt: cleanExcerpt.substring(0, 200)
        };
        
      } catch (apiError) {
        console.error('Mistral API error:', apiError.message);
        // Fall through to mock
      }
    }
    
    return getMockPost(title);
  } catch (error) {
    console.error('Write post error:', error);
    return getMockPost(title);
  }
};

/**
 * Generate outline - PLAIN TEXT
 */
const generateOutline = async (title) => {
  if (aiAvailable && mistral) {
    try {
      const response = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          { 
            role: 'user', 
            content: `Create a 5-point outline for a blog post titled "${title}" about Kenyan real estate. 
Return plain text bullet points only. Use • for bullets. NO HTML tags, NO markdown code blocks.` 
          }
        ],
        maxTokens: 350
      });
      
      const outline = stripHtmlTags(response.choices?.[0]?.message?.content || '');
      if (outline.length > 20) {
        return { success: true, outline };
      }
    } catch (error) {
      console.error('Outline error:', error.message);
    }
  }
  
  return {
    success: true,
    outline: `• Introduction to ${title}
• Market Overview in Kenya
• Investment Benefits
• Key Challenges
• Expert Tips
• Conclusion`
  };
};

/**
 * Auto-complete text - PLAIN TEXT
 */
const autoComplete = async (currentText, context = '') => {
  if (aiAvailable && mistral) {
    try {
      const response = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          { 
            role: 'user', 
            content: `Continue this text about Kenyan real estate: "${currentText}"
Return plain text only. NO HTML tags. Keep it to 2-3 sentences.` 
          }
        ],
        maxTokens: 150
      });
      
      const completion = stripHtmlTags(response.choices?.[0]?.message?.content || '');
      if (completion.length > 10) {
        return { success: true, completion };
      }
    } catch (error) {
      console.error('Auto-complete error:', error.message);
    }
  }
  
  return {
    success: true,
    completion: ` This is an excellent opportunity for investors in Kenya's growing real estate market.`
  };
};

/**
 * SEO optimize - PLAIN TEXT
 */
const optimizeSEO = async (content, targetKeywords) => {
  if (aiAvailable && mistral) {
    try {
      const response = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          { 
            role: 'user', 
            content: `Suggest SEO title and meta description for content about ${targetKeywords.join(', ')} in Kenya. 
Return ONLY valid JSON with no markdown: {"title": "...", "description": "..."}
Keep description under 160 characters. NO HTML tags.` 
          }
        ],
        maxTokens: 250,
        response_format: { type: "json_object" }
      });
      
      const text = cleanJsonResponse(response.choices?.[0]?.message?.content || '');
      const result = safeJsonParse(text, {
        title: `${targetKeywords[0] || 'Real Estate'} in Kenya`,
        description: `Expert guide to ${targetKeywords[0] || 'real estate'} in Kenya.`
      });
      
      return { 
        success: true, 
        seoData: `SEO Title: ${stripHtmlTags(result.title)}\nMeta Description: ${stripHtmlTags(result.description)}` 
      };
    } catch (error) {
      console.error('SEO error:', error.message);
    }
  }
  
  return {
    success: true,
    seoData: `SEO Title: ${targetKeywords[0]} in Kenya\nMeta Description: Complete guide to ${targetKeywords[0]} in the Kenyan real estate market.`
  };
};

module.exports = {
  generateBlogIdeas,
  writeBlogPost,
  generateOutline,
  autoComplete,
  optimizeSEO,
  stripHtmlTags,
  formatPlainText,
  safeJsonParse  // Export for testing/debugging
};