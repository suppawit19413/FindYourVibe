export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const { message, user_vibe } = body;

    if (!message || !user_vibe) {
        return new Response(JSON.stringify({ 
            error: "Missing message or user_vibe parameter" 
        }), { 
            status: 400, 
            headers: { "Content-Type": "application/json" } 
          });
    }

    // System prompt defining the AI persona and context
    const systemPrompt = `คุณคือ "พี่แนะแนว" เป็นพี่แนะแนวการศึกษาที่ใจดี อบอุ่น และเข้าใจวัยรุ่น คุณกำลังให้คำปรึกษาเด็ก ม.6 ที่กำลังค้นหาตัวเอง โดยน้องคนนี้ทำแบบทดสอบและพบว่าตนเองมีบุคลิกภาพแบบ "${user_vibe}" 
กรุณาให้คำแนะนำที่เหมาะสมกับบุคลิกภาพนี้ ตอบอย่างเป็นกันเอง ใช้ภาษาที่วัยรุ่นเข้าใจง่าย ให้กำลังใจ และมีสาระ ไม่ต้องตอบยาวเกินไป เอาแบบพอดีๆ เหมือนแชตคุยกันในแอปพลิเคชัน`;

    // Make request to Pollinations AI (Free API, No API Key required!)
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "openai",
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    if (!response.ok) {
        return new Response(JSON.stringify({ 
            error: "Failed to fetch from AI provider" 
        }), { 
            status: response.status, 
            headers: { "Content-Type": "application/json" } 
        });
    }

    // Pollinations returns plain text directly
    const replyText = await response.text();
    
    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
    });
  }
}
