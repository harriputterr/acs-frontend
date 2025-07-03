export interface VideoChatConfig {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dragPosition: { x: number; y: number };
  isDragging: boolean;
  isVideoOff: boolean;
  isMuted: boolean;
  isSpeakerOff: boolean;
  isLocalVideoMain: boolean;
  callDuration: number;
  handleDragStart: (clientX: number, clientY: number) => void;
  handleEndCall: () => void;
  handleVideoSwitch: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
  setIsLocalVideoMain: React.Dispatch<React.SetStateAction<boolean>>;
  formatTime: (seconds: number) => string
}