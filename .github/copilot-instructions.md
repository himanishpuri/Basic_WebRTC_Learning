<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# WebRTC Video Chat Application

This is a WebRTC video chat application built with React, TypeScript, Tailwind CSS, and Express.

## Project Structure

-  `/client`: React TypeScript frontend with Tailwind CSS
-  `/server`: Express backend for WebRTC signaling

## Technologies

-  WebRTC for peer-to-peer video/audio communication
-  Socket.io for signaling
-  React with TypeScript for frontend
-  Tailwind CSS for styling
-  Express for backend

## Implementation Details

-  WebRTC peer connections are managed in `client/src/services/webrtc.ts`
-  WebRTC signaling is handled by Socket.io in `server/src/index.ts`
-  Video chat UI is implemented in `client/src/components/VideoChat.tsx`
