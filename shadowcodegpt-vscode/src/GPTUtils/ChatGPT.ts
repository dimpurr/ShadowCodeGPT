import fetch from "node-fetch";
import AuthSettings from '../authSettings';


interface ResponseData {
    choices: Array<{
        message: any;
    }>;
}

export async function chatWithGPT(text: string): Promise<string> {
    const apiKey = await AuthSettings.instance.retrieveApiKey();
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const prompt = '解释以下代码在干啥：';

    console.log('Starting GPT request...'); // 添加日志输出

    const truncatedText = text.slice(0, 3000); // Take only the first 3000 characters of the text



    const req = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { "role": "system", "content": "You are a helpful programming assistant." },
                {
                    "role": "user", "content": prompt + ' 【代码开头】' + truncatedText + '【代码结尾】，以下是解释：', // 将传入的文本拼接到提示前面
                }
            ]
        }),

    };
    console.log(req);

    const response = await fetch(apiUrl, req);

    console.log('GPT request completed.'); // 添加日志输出


    const data = (await response.json()) as ResponseData;
    console.log('111', data);
    if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content; // 直接返回结果文本
    } else {
        return 'No response';
    }
}
