# AI-Powered Real-Time Chat Application

A full-stack chatting platform that integrates real-time messaging with advanced AI features like automated replies and conversation summarization.

## Key Features
* **Real-Time Communication**: Instant messaging powered by WebSockets (STOMP/SockJS).
* **AI Auto-Reply**: Context-aware responses from "BRO (AI)" generated based on the conversation history.
* **Smart Summarization**: An AI-driven feature that summarizes the most recent 20 messages in any chat room.
* **Language Tools**: Integrated AI for rephrasing, tone detection, and multi-language translation.

## Tech Stack
* **Backend**: Java Spring Boot, Spring Security (JWT), Spring Data MongoDB.
* **Frontend**: React, Tailwind CSS, Axios.
* **Database**: MongoDB.
* **AI Integration**: OpenAI API (Llama-3.3-70b-versatile).

## Getting Started
1. **Clone the repository**: `git clone https://github.com/shreyasv26/AI-ChatApp.git`
2. **Setup Backend**:
   - Configure your OpenAI API key in `application.properties`.
   - Ensure MongoDB is running on `localhost:27017`.
   - Run `mvn spring-boot:run`.
3. **Setup Frontend**:
   - Navigate to `chatapp-frontend`.
   - Run `npm install` and `npm run dev`.
