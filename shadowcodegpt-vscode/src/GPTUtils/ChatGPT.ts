import fetch from "node-fetch";

interface ResponseData {
    choices: Array<{
        text: string;
    }>;
}

export async function chatWithGPT(text: string): Promise<string> {
    const apiKey = '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';
    const apiUrl = 'https://api.openai.com/v1/completions';
    const prompt = 'can you help me on writing code';

        console.log('Starting GPT request...'); // 添加日志输出

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt + ' ' + text, // 将传入的文本拼接到提示前面
        }),
    });

        console.log('GPT request completed.'); // 添加日志输出


    const data = (await response.json()) as ResponseData;
    if (data.choices && data.choices.length > 0) {
        return data.choices[0].text; // 直接返回结果文本
    } else {
        return 'No response';
    }
}
