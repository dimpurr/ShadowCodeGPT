import fetch from "node-fetch";
import AuthSettings from '../authSettings';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = 'gpt-3.5-turbo';

interface ResponseData {
    choices: Array<{
        message: any;
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

export async function chatWithGPT(text: string): Promise<string> {
    try {
        const apiKey = await AuthSettings.instance.retrieveApiKey();
        
        if (typeof apiKey === 'undefined') {
            console.error('API Key is undefined');
            return 'Error: API Key is undefined';
        }

        const batchSize = 3000;
        const totalBatches = Math.ceil(text.length / batchSize);
        let finalSummary = "";

        // Initialize messages array with the system message
        let messages = [
            { role: "system", content: "You are a helpful programming assistant." }
        ];

        for (let i = 0; i < totalBatches; i++) {
            const textBatch = text.slice(i * batchSize, (i + 1) * batchSize);
            const prompt = '解释以下代码在干啥：';
            let content = `${prompt} 由于这是一个很长的代码，我会分批发送，以下是批次（${i + 1}/${totalBatches}）：【代码开头】${textBatch}【批次（${i + 1}/${totalBatches}）结尾，请返回目前的总结，并准备好接受下一批次（${i + 2}/${totalBatches}）】`;
            
            if (i + 1 === totalBatches) {
                content = `${prompt} 要你分析的要求不变，继续发送代码，【批次（${i + 1}/${totalBatches}）开头】${textBatch}【批次（${i + 1}/${totalBatches}）结尾，请返回目前批次的总结，并对已接收的全部总结一次】`;
            }

            // Add the new user message to the messages array
            messages.push({ role: "user", content });

            const requestBody = buildRequestBody(messages, apiKey);
            console.log('req', requestBody);
            const response = await fetch(API_URL, requestBody);
            const data = (await response.json()) as ResponseData;

            if (data.choices && data.choices.length > 0) {
                // Add the assistant's message to the messages array
                messages.push({ role: "assistant", content: data.choices[0].message.content });
                finalSummary += data.choices[0].message.content + "\n";
            } else {
                finalSummary += 'No response for this batch.\n';
            }
        }

        return finalSummary;
    } catch (error) {
        console.error('Error in GPT request:', error);
        return 'Error during processing';
    }
}
