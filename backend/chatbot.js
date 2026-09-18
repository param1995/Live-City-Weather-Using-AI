import './config.js';
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';
import NodeCache from 'node-cache';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 });

export async function generate(userMessage, threadId) {
    if (/^(hi|hello|hey)( there)?[!. ]*$/i.test(userMessage.trim())) {
        return 'Hello! How can I assist you today?';
    }
    const baseMessages = [
        {
            role: 'system',
            content: `You are a smart personal assistant.
                    If you know the answer to a question, answer it directly in plain English.
                    If the answer requires real-time, local, or up-to-date information, or if you don’t know the answer, use the available tools to find it.
                    You have access to the following tool:
                    webSearch(query: string): Use this to search the internet for current or unknown information.
                    Decide when to use your own knowledge and when to use the tool.
                    Do not mention the tool unless needed.

                    Examples:
                    Q: What is the capital of France?
                    A: The capital of France is Paris.

                    Q: What’s the weather in Mumbai right now?
                    A: (use the search tool to find the latest weather)

                    Q: Who is the Prime Minister of India?
                    A: The current Prime Minister of India is Narendra Modi.

                    Q: Tell me the latest IT news.
                    A: (use the search tool to get the latest news)

                    Q: What is a today's pune temperature?
                    A: (use the search tool to get the latest news)

                    Q: What is a today Mumbai's  temperature?
                    A: (use the search tool to get the latest news)
                    current date and time: ${new Date().toUTCString()}`,
        },
    ];

    const messages = cache.get(threadId) ?? baseMessages;

    messages.push({
        role: 'user',
        content: userMessage,
    });

    const maxRetries = 10;
    let count = 0;

    while (true) {
        if (count > maxRetries) {
            return 'I Could not find the result, please try again';
        }
        count++;

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
            cache.set(threadId, messages);
            return completions.choices[0].message.content;
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

async function webSearch({ query }) {
    console.log('Calling web search...');
    const response = await tvly.search(query);
    return response.results.map((result) => result.content).join('\n\n');
}
