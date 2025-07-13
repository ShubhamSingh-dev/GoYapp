import {
  WEBRTC_CONFIG,
  MEDIA_CONSTRAINTS,
  SCREEN_SHARE_CONSTRAINTS,
} from "@/app/utils/constants";

export class WebRTCClient {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onRemoteStreamCallback?: (
    userId: string,
    stream: MediaStream
  ) => void;
  private onRemoteStreamRemovedCallback?: (userId: string) => void;
  private wsClient: any;

  constructor(wsClient: any) {
    this.wsClient = wsClient;
  }

  async initializeLocalStream(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(
        MEDIA_CONSTRAINTS
      );
      return this.localStream;
    } catch (error) {
      console.error("Error accessing user media:", error);
      throw error;
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia(
        SCREEN_SHARE_CONSTRAINTS
      );

      // Replace video track in peer connections
      if (this.localStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = this.peerConnections
          .values()
          .next()
          .value?.getSenders()
          .find((s: RTCRtpSender) => s.track?.kind === "video");

        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        // Replace video track in local stream
        const oldVideoTrack = this.localStream.getVideoTracks()[0];
        if (oldVideoTrack) {
          this.localStream.removeTrack(oldVideoTrack);
        }
        this.localStream.addTrack(videoTrack);
      }

      return screenStream;
    } catch (error) {
      console.error("Error starting screen share:", error);
      throw error;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this.localStream) {
      // Get camera stream again
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: MEDIA_CONSTRAINTS.video,
        audio: false,
      });

      const videoTrack = cameraStream.getVideoTracks()[0];
      const sender = this.peerConnections
        .values()
        .next()
        .value?.getSenders()
        .find((s: RTCRtpSender) => s.track?.kind === "video");

      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      // Replace video track in local stream
      const oldVideoTrack = this.localStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        this.localStream.removeTrack(oldVideoTrack);
      }
      this.localStream.addTrack(videoTrack);
    }
  }

  async createPeerConnection(userId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(WEBRTC_CONFIG);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(userId, event.streams[0]);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.wsClient.sendSignalingMessage(userId, "ice-candidate", {
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(
        `Peer connection state with ${userId}:`,
        peerConnection.connectionState
      );
      if (
        peerConnection.connectionState === "disconnected" ||
        peerConnection.connectionState === "failed"
      ) {
        this.removePeerConnection(userId);
      }
    };

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  async createOffer(userId: string): Promise<void> {
    const peerConnection = await this.createPeerConnection(userId);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    this.wsClient.sendSignalingMessage(userId, "offer", {
      sdp: offer,
    });
  }

  async handleOffer(
    userId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
    const peerConnection = await this.createPeerConnection(userId);

    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    this.wsClient.sendSignalingMessage(userId, "answer", {
      sdp: answer,
    });
  }

  async handleAnswer(
    userId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  }

  async handleIceCandidate(
    userId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  }

  removePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);

      if (this.onRemoteStreamRemovedCallback) {
        this.onRemoteStreamRemovedCallback(userId);
      }
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  onRemoteStream(
    callback: (userId: string, stream: MediaStream) => void
  ): void {
    this.onRemoteStreamCallback = callback;
  }

  onRemoteStreamRemoved(callback: (userId: string) => void): void {
    this.onRemoteStreamRemovedCallback = callback;
  }

  cleanup(): void {
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }
}
