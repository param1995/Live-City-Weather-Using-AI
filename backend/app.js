import readline from 'node:readline/promises';
import './config.js';
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const messages = [
        {
            role: 'system',
            content: `You are a smart personal assistant who answers the asked questions.
                You have access to following tools:
                1. searchWeb({query}: {query: string}) //Search the latest information and realtime data on the internet.
                current date and time: ${new Date().toUTCString()}`,
        },
    ];

    while (true) {
        const question = await rl.question('You: ');
        if (question === 'bye') {
            break;
        }

        messages.push({
            role: 'user',
            content: question,
        });

        while (true) {
            const completions = await groq.chat.completions.create({
                model: 'openai/gpt-oss-120b',
                temperature: 0,
                messages,
                tools: [
                    {
                        type: 'function',
                        function: {
                            name: 'webSearch',
                            description: 'Search the latest information and realtime data on the internet.',
                            parameters: {
                                type: 'object',
                                properties: {
                                    query: {
                                        type: 'string',
                                        description: 'The search query to perform search on.',
                                    },
                                },
                                required: ['query'],
                            },
                        },
                    },
                ],
                tool_choice: 'auto',
            });

            messages.push(completions.choices[0].message);
            const toolCalls = completions.choices[0].message.tool_calls;

            if (!toolCalls) {
                console.log(`Assistant: ${completions.choices[0].message.content}`);
                break;
            }

            for (const tool of toolCalls) {
                if (tool.function.name === 'webSearch') {
                    const toolResult = await webSearch(JSON.parse(tool.function.arguments));
                    messages.push({
                        tool_call_id: tool.id,
                        role: 'tool',
                        name: tool.function.name,
                        content: toolResult,
                    });
                }
            }
        }
    }

    rl.close();
}

main();

async function webSearch({ query }) {
    console.log('Calling web search...');
    const response = await tvly.search(query);
    return response.results.map((result) => result.content).join('\n\n');
}
