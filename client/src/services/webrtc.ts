import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

interface PeerConnection {
	connection: RTCPeerConnection;
	stream?: MediaStream;
}

export class WebRTCService {
	private socket: Socket;
	private localStream?: MediaStream;
	private roomId: string;
	private userId: string;
	private peerConnections: Map<string, PeerConnection> = new Map();
	private onStreamCallback: (stream: MediaStream, userId: string) => void;
	private onUserDisconnectedCallback: (userId: string) => void;

	constructor(
		onStream: (stream: MediaStream, userId: string) => void,
		onUserDisconnected: (userId: string) => void,
		roomId?: string,
	) {
		this.socket = io("http://localhost:3001");
		this.userId = uuidv4();
		this.roomId = roomId || this.createRoomId();
		this.onStreamCallback = onStream;
		this.onUserDisconnectedCallback = onUserDisconnected;
		this.setupSocketListeners();
	}

	private createRoomId(): string {
		return uuidv4().substring(0, 8);
	}

	private setupSocketListeners(): void {
		// Handle when a new user connects to the room
		this.socket.on("user-connected", async (userId: string) => {
			console.log("User connected:", userId);
			await this.createPeerConnection(userId);
			await this.createOffer(userId);
		});

		// Handle when a user disconnects from the room
		this.socket.on("user-disconnected", (userId: string) => {
			console.log("User disconnected:", userId);
			this.removePeerConnection(userId);
			this.onUserDisconnectedCallback(userId);
		});

		// Handle receiving an offer
		this.socket.on("offer", async (offer, userId) => {
			await this.handleOffer(offer, userId);
		});

		// Handle receiving an answer
		this.socket.on("answer", (answer, userId) => {
			this.handleAnswer(answer, userId);
		});

		// Handle receiving an ICE candidate
		this.socket.on("ice-candidate", (candidate, userId) => {
			this.handleIceCandidate(candidate, userId);
		});
	}

	public async joinRoom(): Promise<string> {
		try {
			// Get user media stream
			this.localStream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});

			// Join the room
			this.socket.emit("join-room", this.roomId, this.userId);

			return this.roomId;
		} catch (error) {
			console.error("Error joining room:", error);
			throw error;
		}
	}

	public getLocalStream(): MediaStream | undefined {
		return this.localStream;
	}

	public getRoomId(): string {
		return this.roomId;
	}

	public getUserId(): string {
		return this.userId;
	}

	private async createPeerConnection(userId: string): Promise<void> {
		try {
			const configuration = {
				iceServers: [
					{ urls: "stun:stun.l.google.com:19302" },
					{ urls: "stun:stun1.l.google.com:19302" },
				],
			};

			const peerConnection = new RTCPeerConnection(configuration);

			// Add our local stream tracks to the connection
			if (this.localStream) {
				this.localStream.getTracks().forEach((track) => {
					peerConnection.addTrack(track, this.localStream!);
				});
			}

			// Set up ICE candidate handling
			peerConnection.onicecandidate = (event) => {
				if (event.candidate) {
					this.socket.emit(
						"ice-candidate",
						event.candidate,
						this.roomId,
						this.userId,
					);
				}
			};

			// Handle when remote stream is added
			peerConnection.ontrack = (event) => {
				const remoteStream = event.streams[0];
				this.peerConnections.set(userId, {
					connection: peerConnection,
					stream: remoteStream,
				});
				this.onStreamCallback(remoteStream, userId);
			};

			this.peerConnections.set(userId, {
				connection: peerConnection,
			});
		} catch (error) {
			console.error("Error creating peer connection:", error);
		}
	}

	private async createOffer(userId: string): Promise<void> {
		try {
			const peerConnection = this.peerConnections.get(userId)?.connection;
			if (!peerConnection) return;

			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);

			this.socket.emit("offer", offer, this.roomId, this.userId);
		} catch (error) {
			console.error("Error creating offer:", error);
		}
	}

	private async handleOffer(
		offer: RTCSessionDescriptionInit,
		userId: string,
	): Promise<void> {
		try {
			// Create peer connection if it doesn't exist
			if (!this.peerConnections.has(userId)) {
				await this.createPeerConnection(userId);
			}

			const peerConnection = this.peerConnections.get(userId)?.connection;
			if (!peerConnection) return;

			// Set the remote description
			await peerConnection.setRemoteDescription(
				new RTCSessionDescription(offer),
			);

			// Create and send answer
			const answer = await peerConnection.createAnswer();
			await peerConnection.setLocalDescription(answer);

			this.socket.emit("answer", answer, this.roomId, this.userId);
		} catch (error) {
			console.error("Error handling offer:", error);
		}
	}

	private async handleAnswer(
		answer: RTCSessionDescriptionInit,
		userId: string,
	): Promise<void> {
		try {
			const peerConnection = this.peerConnections.get(userId)?.connection;
			if (!peerConnection) return;

			await peerConnection.setRemoteDescription(
				new RTCSessionDescription(answer),
			);
		} catch (error) {
			console.error("Error handling answer:", error);
		}
	}

	private async handleIceCandidate(
		candidate: RTCIceCandidate,
		userId: string,
	): Promise<void> {
		try {
			const peerConnection = this.peerConnections.get(userId)?.connection;
			if (!peerConnection) return;

			await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
		} catch (error) {
			console.error("Error handling ICE candidate:", error);
		}
	}

	private removePeerConnection(userId: string): void {
		const peerConnection = this.peerConnections.get(userId);
		if (peerConnection) {
			peerConnection.connection.close();
			this.peerConnections.delete(userId);
		}
	}

	public disconnect(): void {
		// Close all peer connections
		this.peerConnections.forEach((peerConnection) => {
			peerConnection.connection.close();
		});
		this.peerConnections.clear();

		// Stop local stream tracks
		if (this.localStream) {
			this.localStream.getTracks().forEach((track) => track.stop());
		}

		// Disconnect socket
		this.socket.disconnect();
	}
}
