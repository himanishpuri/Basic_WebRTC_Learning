import { useState, useEffect, useRef } from "react";
import { WebRTCService } from "../services/webrtc";

interface Video {
	id: string;
	stream: MediaStream;
}

const VideoChat: React.FC = () => {
	const [webrtcService, setWebrtcService] = useState<WebRTCService | null>(
		null,
	);
	const [videos, setVideos] = useState<Video[]>([]);
	const [roomId, setRoomId] = useState<string>("");
	const [isJoined, setIsJoined] = useState<boolean>(false);
	const [inputRoomId, setInputRoomId] = useState<string>("");
	const [isCopied, setIsCopied] = useState<boolean>(false);

	// Handle a new video stream (local or remote)
	const handleStream = (stream: MediaStream, userId: string) => {
		setVideos((prev) => [
			...prev.filter((v) => v.id !== userId),
			{ id: userId, stream },
		]);
	};

	// Handle when a user disconnects
	const handleUserDisconnected = (userId: string) => {
		setVideos((prev) => prev.filter((v) => v.id !== userId));
	};

	// Join a room with an existing room ID
	const joinRoom = async () => {
		if (!inputRoomId) return;
		try {
			const service = new WebRTCService(
				handleStream,
				handleUserDisconnected,
				inputRoomId,
			);

			const createdRoomId = await service.joinRoom();
			setRoomId(createdRoomId);
			setWebrtcService(service);

			// Add local stream
			const localStream = service.getLocalStream();
			if (localStream) {
				handleStream(localStream, "local");
			}

			setIsJoined(true);
		} catch (error) {
			console.error("Error joining room:", error);
		}
	};

	// Create a new room
	const createRoom = async () => {
		try {
			const service = new WebRTCService(
				handleStream,
				handleUserDisconnected,
			);

			const createdRoomId = await service.joinRoom();
			setRoomId(createdRoomId);
			setWebrtcService(service);

			// Add local stream
			const localStream = service.getLocalStream();
			if (localStream) {
				handleStream(localStream, "local");
			}

			setIsJoined(true);
		} catch (error) {
			console.error("Error creating room:", error);
		}
	};

	// Copy the room ID to clipboard
	const copyRoomId = () => {
		navigator.clipboard.writeText(roomId);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 3000);
	};

	// Disconnect from the room
	const disconnect = () => {
		if (webrtcService) {
			webrtcService.disconnect();
			setWebrtcService(null);
			setVideos([]);
			setRoomId("");
			setIsJoined(false);
		}
	};

	// Clean up on component unmount
	useEffect(() => {
		return () => {
			if (webrtcService) {
				webrtcService.disconnect();
			}
		};
	}, [webrtcService]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
			<div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
				<h1 className="text-2xl font-bold text-center mb-6">
					WebRTC Video Chat
				</h1>

				{!isJoined ? (
					<div className="space-y-4">
						<div className="flex flex-col sm:flex-row gap-4">
							<button
								onClick={createRoom}
								className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
							>
								Create New Room
							</button>
							<div className="flex flex-1 gap-2">
								<input
									type="text"
									placeholder="Enter Room ID"
									value={inputRoomId}
									onChange={(e) => setInputRoomId(e.target.value)}
									className="flex-1 border rounded py-2 px-3"
								/>
								<button
									onClick={joinRoom}
									className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
									disabled={!inputRoomId}
								>
									Join Room
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
							<div className="flex items-center gap-2">
								<span className="font-bold">Room ID:</span>
								<code className="bg-gray-100 px-2 py-1 rounded">
									{roomId}
								</code>
								<button
									onClick={copyRoomId}
									className="bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded text-sm"
								>
									{isCopied ? "Copied!" : "Copy"}
								</button>
							</div>
							<button
								onClick={disconnect}
								className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
							>
								Leave Room
							</button>
						</div>

						<div
							className={`grid gap-4 ${
								videos.length > 1
									? "grid-cols-1 md:grid-cols-2"
									: "grid-cols-1"
							}`}
						>
							{videos.map((video) => (
								<VideoPlayer
									key={video.id}
									stream={video.stream}
									isLocal={video.id === "local"}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

interface VideoPlayerProps {
	stream: MediaStream;
	isLocal: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, isLocal }) => {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.srcObject = stream;
		}
	}, [stream]);

	return (
		<div className="relative rounded-lg overflow-hidden bg-black">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted={isLocal} // Mute local video to prevent feedback
				className="w-full h-full object-cover"
			/>
			<div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
				{isLocal ? "You" : "Peer"}
			</div>
		</div>
	);
};

export default VideoChat;
