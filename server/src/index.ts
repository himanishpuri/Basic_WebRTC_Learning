import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, "../../client/dist")));

// Signaling server for WebRTC
io.on("connection", (socket) => {
	console.log("User connected:", socket.id);

	// Handle when a user joins a room
	socket.on("join-room", (roomId, userId) => {
		console.log(`User ${userId} joined room ${roomId}`);
		socket.join(roomId);
		// Notify others in the room
		socket.to(roomId).emit("user-connected", userId);

		// Handle when user disconnects
		socket.on("disconnect", () => {
			console.log(`User ${userId} disconnected`);
			socket.to(roomId).emit("user-disconnected", userId);
		});
	});

	// Handle WebRTC signaling
	socket.on("offer", (offer, roomId, userId) => {
		socket.to(roomId).emit("offer", offer, userId);
	});

	socket.on("answer", (answer, roomId, userId) => {
		socket.to(roomId).emit("answer", answer, userId);
	});

	socket.on("ice-candidate", (candidate, roomId, userId) => {
		socket.to(roomId).emit("ice-candidate", candidate, userId);
	});
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
