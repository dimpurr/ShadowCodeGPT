import fetch from "node-fetch";
import AuthSettings from '../authSettings';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-3.5-turbo';

interface ResponseData {
    choices?: Array<{
        message: {
            content: string;
        };
    }>;
}

function buildRequestBody(messages: any[], apiKey: string): any {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages: messages
        })
    };
}


export async function chatWithGPT(text: string, handleBatchResponse: (batchNumber: number, totalBatches: number, content: string) => void): Promise<void> {
    try {
        const apiKey = await AuthSettings.instance.retrieveApiKey();

        if (typeof apiKey === 'undefined') {
            console.error('API Key is undefined');
            handleBatchResponse(0, 0, 'Error: API Key is undefined');
            return;
        }

        const maxMessageLength = 2000; // Adjust this based on the API limits
        const batchSize = 3000;
        const totalBatches = Math.ceil(text.length / batchSize);

        let messages = [
            { role: "system", content: "You are a helpful programming assistant. 工作语言：中文" }
        ];

        for (let i = 0; i < totalBatches; i++) {
            const textBatch = text.slice(i * batchSize, (i + 1) * batchSize);
            let content = `分析代码，批次 (${i + 1}/${totalBatches}): ${textBatch}`;

            if (i + 1 === totalBatches) {
                content = `分析代码，最终批次 (${i + 1}/${totalBatches}): ${textBatch}. 给一个总结`;
            }

            messages.push({ role: "user", content });

            const requestBody = buildRequestBody(messages.slice(-3), apiKey);
            const response = await fetch(API_URL, requestBody);
            const data: ResponseData = (await response.json()) as any;

            if (data.choices && data.choices.length > 0) {
                messages.push({ role: "assistant", content: data.choices[0].message.content });
                handleBatchResponse(i + 1, totalBatches, data.choices[0].message.content);
            }
        }
    } catch (error) {
        console.error('Error in GPT request:', error);
        handleBatchResponse(0, 0, 'Error during processing');
    }
}

