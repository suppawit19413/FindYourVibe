export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { message, user_vibe } = body;

    const apiKey = env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key. Please set DEEPSEEK_API_KEY in environment variables." }), { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    if (!message || !user_vibe) {
        return new Response(JSON.stringify({ error: "Missing message or user_vibe parameter" }), { 
            status: 400, 
            headers: { "Content-Type": "application/json" } 
          });
    }

    const systemPrompt = `คุณคือ "พี่แนะแนว" เป็นพี่แนะแนวการศึกษาที่ใจดี อบอุ่น และเข้าใจวัยรุ่น คุณกำลังให้คำปรึกษาเด็ก ม.6 ที่กำลังค้นหาตัวเอง โดยน้องคนนี้ทำแบบทดสอบและพบว่าตนเองมีบุคลิกภาพแบบ "${user_vibe}" 
กรุณาให้คำแนะนำที่เหมาะสมกับบุคลิกภาพนี้ ตอบอย่างเป็นกันเอง ใช้ภาษาที่วัยรุ่นเข้าใจง่าย ให้กำลังใจ และมีสาระ`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        return new Response(JSON.stringify({ error: data.error?.message || "Failed to fetch from DeepSeek API" }), { 
            status: response.status, 
            headers: { "Content-Type": "application/json" } 
        });
    }

    const reply = data.choices[0].message.content;
    
    return new Response(JSON.stringify({ reply }), {
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
