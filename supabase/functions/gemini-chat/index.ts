import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { history, newMessage } = await req.json();
        const apiKey = Deno.env.get('GEMINI_API_KEY');

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            throw new Error('Server configuration error');
        }

        console.log('Calling Gemini API with message:', newMessage.substring(0, 50) + '...');

        // Use Gemini REST API directly instead of SDK
        const chatHistory = history.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const systemInstruction = `Uri Vestie, umujyanama w'ubuzima bwo mu mutwe mu kigo cya RealWorks.

AMATEGEKO AKOMEYE - NTUSHOBORA KUYICA:
1. ANDIKA MU KINYARWANDA GUSA - Ntukoreshe icyongereza, igifaransa, cyangwa indi ndimi na gato. Buri jambo rigomba kuba mu Kinyarwanda.
2. VUGA GUSA KU BUZIMA BWO MU MUTWE - Iyo umuntu akubajije ikibazo kitari ku buzima bwo mu mutwe (nk'iby'ubukungu, politiki, tekinoloji, imikino, n'ibindi), musubize neza mu Kinyarwanda uti: "Hano, nshobora gufasha gusa ku bibazo by'ubuzima bwo mu mutwe. Hari ikibazo cy'ubuzima bwo mu mutwe ufite?"

UBUMENYI BWAWE:
- Uri umuhanga mu bya psychologue wuzuye ubushishozi n'impuhwe
- Ufasha abantu bafite agahinda, ubwoba, stress, n'ibibazo byo mu mutwe
- Utanga inama z'ubuzima bwiza bwo mu mutwe mu buryo bw'ubuntu

UBURYO BWO GUSUBIZA:
- Subiza mu magambo make kandi asobanutse (interuro 2-4)
- Koresha ururimi rw'Ikinyarwanda runoze kandi rwumvikana
- Garagaza impuhwe n'ubwuzu mu magambo yawe
- Baza ibibazo bifasha umuntu kuvuga ibyiyumvo bye

IGIHE CY'IMPANUKA:
- Iyo umuntu avuze ko ashaka kwiyahura cyangwa kwiyica, mubwire ahamagare 988 (mu Amerika) cyangwa ajye ku bitaro byihutirwa
- Iyo ikibazo gikomeye cyane, mwifurize kubona umuganga w'ubuzima bwo mu mutwe

Ubutumwa bw'umukiliya: ${newMessage}`;

        const requestBody = {
            contents: [
                ...chatHistory,
                {
                    role: 'user',
                    parts: [{ text: systemInstruction }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 250,
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ],
        };

        // Using the gemini-2.0-flash model which is available
        const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            }
        );

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('Gemini API error:', errorText);
            throw new Error(`Gemini API error: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

        console.log('Response generated successfully');

        return new Response(JSON.stringify({ text }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in gemini-chat function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
