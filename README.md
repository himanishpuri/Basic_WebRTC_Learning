# WebRTC Video Chat Application

A real-time video chat application built with WebRTC, React, TypeScript, Tailwind CSS, and Express.

## Features

-  📹 Real-time video and audio communication
-  🔄 Peer-to-peer connections using WebRTC
-  🚪 Create or join rooms via unique room IDs
-  🎨 Responsive UI built with Tailwind CSS
-  📱 Mobile-friendly design

## Project Structure

-  `/client` - React TypeScript frontend with Tailwind CSS
-  `/server` - Express backend for signaling

## Getting Started

### Prerequisites

-  Node.js (v14 or newer)
-  npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running the Application

1. Start the server:

```bash
cd server
npm run dev
```

2. In a new terminal, start the client:

```bash
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. Open the application in your browser
2. Choose either "Create New Room" or enter a Room ID and click "Join Room"
3. Allow camera and microphone access when prompted
4. Share the Room ID with others to join the same room
5. Enjoy real-time video and audio communication!

## Technologies Used

-  **Frontend**

   -  React with TypeScript
   -  Tailwind CSS
   -  WebRTC API
   -  Socket.io client

-  **Backend**
   -  Express
   -  Socket.io
   -  TypeScript

## Development

### Building for Production

#### Client

```bash
cd client
npm run build
```

#### Server

```bash
cd server
npm run build
npm start
```


