import dotenv from 'dotenv';

dotenv.config();

console.log('Environment loaded');
console.log('GROQ API key:', Boolean(process.env.GROQ_API_KEY));
console.log('TAVILY API key:', Boolean(process.env.TAVILY_API_KEY));
