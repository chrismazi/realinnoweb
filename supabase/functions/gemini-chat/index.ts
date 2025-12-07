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
        const body = await req.json();
        const history = body.history || [];
        const newMessage = body.newMessage || '';
        
        if (!newMessage) {
            throw new Error('No message provided');
        }
        
        const apiKey = Deno.env.get('GEMINI_API_KEY');

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            throw new Error('Server configuration error: API key missing');
        }

        console.log('Calling Gemini API with message:', newMessage.substring(0, 50) + '...');

        // Use Gemini REST API directly instead of SDK
        const formattedHistory = history.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const systemInstructionText = `Uri Vestie, umujyanama w'ubuzima bwo mu mutwe mu kigo cya RealWorks.

AMATEGEKO AKOMEYE - NTUSHOBORA KUYICA:
1. ANDIKA MU KINYARWANDA GUSA - Ntukoreshe icyongereza, igifaransa, cyangwa indi ndimi na gato. Buri jambo rigomba kuba mu Kinyarwanda.
2. VUGA GUSA KU BUZIMA BWO MU MUTWE - Iyo umuntu akubajije ikibazo kitari ku buzima bwo mu mutwe (nk'iby'ubukungu, politiki, tekinoloji, imikino, n'ibindi), subiza IJAMBO KU RINDI uti: "Hano, nshobora gufasha gusa ku bibazo by'ubuzima bwo mu mutwe. Ese hari ibibazo bikugoye cyane mu buzima?" Ntukoreshe "Mbabarira" - koresha "Hano" gusa.

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
- Iyo umuntu avuze ko ashaka kwiyahura cyangwa kwiyica, mubwire ahamagare 114 cyangwa ajye ku bitaro byihutirwa
- Iyo ikibazo gikomeye cyane, mwifurize kubona umuganga w'ubuzima bwo mu mutwe

Ubutumwa bw'umukiliya: ${newMessage}`;

        const requestBody = {
            systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstructionText }]
            },
            contents: [
                ...formattedHistory,
                {
                    role: 'user',
                    parts: [{ text: newMessage }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 400,
                temperature: 0.6,
                topK: 32,
                topP: 0.9,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ],
        };

        const modelEndpoints = [
            {
                name: 'gemini-2.5-flash',
                url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
            },
            {
                name: 'gemini-1.0-pro-latest',
                url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:generateContent'
            },
            {
                name: 'gemini-1.5-flash-latest',
                url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
            },
            {
                name: 'gemini-2.0-flash',
                url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
            }
        ];

        let lastError: string | null = null;

        for (const model of modelEndpoints) {
            try {
                const apiResponse = await fetch(
                    `${model.url}?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody),
                    }
                );

                if (!apiResponse.ok) {
                    const errorText = await apiResponse.text();
                    console.error(`Gemini API error (${model.name}):`, errorText);

                    if (apiResponse.status === 404) {
                        lastError = `Model ${model.name} not available for this API key.`;
                        continue;
                    }

                    let parsedMessage = `Gemini API error: ${apiResponse.status}`;
                    try {
                        const parsed = JSON.parse(errorText);
                        if (parsed?.error?.message) {
                            parsedMessage = parsed.error.message;
                        }
                    } catch (_) {
                        // ignore
                    }

                    throw new Error(parsedMessage);
                }

                const data = await apiResponse.json();
                const parts = data.candidates?.[0]?.content?.parts || [];
                const combinedText = parts
                    .map((part: { text?: string }) => part?.text?.trim() || '')
                    .filter(Boolean)
                    .join('\n')
                    .trim();

                const invalidText = !combinedText || combinedText.toLowerCase().includes('no response generated');

                if (invalidText) {
                    console.warn(`Model ${model.name} returned empty/invalid text, trying next fallback.`);
                    lastError = `Model ${model.name} returned empty response.`;
                    continue;
                }

                console.log(`Response generated successfully using ${model.name}`);

                return new Response(JSON.stringify({ text: combinedText }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            } catch (modelError) {
                console.error(`Error while calling ${model.name}:`, modelError);
                lastError = (modelError as Error).message;
            }
        }

        throw new Error(lastError || 'No Gemini models are currently available.');
    } catch (error) {
        console.error('Error in gemini-chat function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
