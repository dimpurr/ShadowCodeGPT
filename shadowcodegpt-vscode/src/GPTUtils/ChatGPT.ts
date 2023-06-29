import fetch from "node-fetch";

interface ResponseData {
    choices: Array<{
        text: string;
    }>;
}

export async function chatWithGPT(showMessage: (message: string) => void) {
    const apiKey = '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';
    const apiUrl = 'https://api.openai.com/v1/completions';
    const prompt = 'can you help me on writing code';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
        }),
    });

    const data = (await response.json()) as ResponseData;
    if (data.choices && data.choices.length > 0) {
        showMessage(data.choices[0].text);
    } else {
        showMessage('No response');
    }
}
