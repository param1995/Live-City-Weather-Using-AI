# Live City Weather Using AI

A full-stack AI-powered chat application that helps users ask weather and general information questions using a Groq-based language model and live web search via Tavily. The app includes an Express backend and an Angular frontend.

## Project Overview

This project combines:

- Angular frontend for the chat interface
- Express backend for API handling and orchestration
- Groq LLM for generating answers
- Tavily search tool for real-time or web-based information
- Thread-based message memory using a cache

## Tech Stack

- Frontend: Angular 21
- Backend: Node.js + Express
- AI model: Groq API
- Search: Tavily API
- Runtime: Node.js

## Folder Structure

```bash
Live-City-Weather-Using-AI/
├── backend/
│   ├── app.js
│   ├── chatbot.js
│   ├── config.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── angular.json
│   ├── package.json
│   ├── src/
│   └── tsconfig*.json
├── .gitignore
└── README.md
```

## Features

- Real-time AI chat interface
- Weather and general query support
- Web search fallback for fresh or unknown information
- Thread-based conversation handling
- CORS-enabled backend API
- Angular single-page frontend experience

## Prerequisites

Before running the project, make sure you have:

- Node.js 18 or later
- npm
- Groq API key
- Tavily API key

## Environment Setup

Create a `.env` file inside the `backend` directory with your API keys:

```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

## Installation

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

## Run the Application

### Start the backend

```bash
cd backend
npm start
```

The backend runs on:

```text
http://localhost:3001
```

### Start the frontend

```bash
cd frontend
npx ng serve
```

The Angular app runs on:

```text
http://localhost:4200
```

## API Endpoint

### POST /chat

Request body:

```json
{
  "message": "What is the weather in Mumbai today?",
  "threadId": "sample-thread-123"
}
```

Example response:

```json
{
  "message": "The current weather in Mumbai is ..."
}
```

## Notes

- The backend validates the presence of both `message` and `threadId` before processing.
- A timeout is enforced for chat generation requests.
- Message history is cached per thread for a limited duration.
- The app is designed for local development and can be extended for production deployment.

## Common Troubleshooting

### Port already in use

If port `3001` is already busy, stop the existing process and start the backend again.

### Missing API keys

If the app throws errors related to API access, verify that the `.env` file exists and the keys are correct.

### Frontend not connecting to backend

Check that both services are running and that the frontend API URL matches the backend port.

## License

This project is currently unlicensed unless you add your own license file.
