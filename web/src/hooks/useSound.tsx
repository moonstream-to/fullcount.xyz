import { soundMapping } from "../components/layout/SoundMapping";
import { useGameContext } from "../contexts/GameContext";

export type SoundSource =
  | "menuItem"
  | "menuButton"
  | "soundVolume"
  | "launchButton"
  | "modeSelector"
  | "characterSelector"
  | "batButton"
  | "pitchButton"
  | "viewSelector"
  | "cancelButton"
  | "createButton"
  | "imageSelector"
  | "addCharacter"
  | "pitchHistoryOpen"
  | "pitchHistoryClose"
  | "grid"
  | "typeSelector"
  | "heatmapClick"
  | "commitButton"
  | "homeButton"
  | "loss"
  | "win"
  | "heartbeat"
  | "stadium"
  | "contactHit"
  | "powerHit"
  | "walk"
  | "catch"
  | "error"
  | "notification";

// Custom hook to play sound
export const useSound = () => {
  const { soundVolume } = useGameContext();
  return (source: SoundSource) => {
    const soundName = soundMapping[source];
    if (soundName && soundVolume) {
      const soundElement = document.getElementById(soundName) as HTMLAudioElement;
      if (!soundElement) {
        console.warn("Sound element not found:", soundName, source);
        return;
      }
      soundElement.currentTime = 0;
      soundElement.volume = soundVolume / 100;
      soundElement.play();
    }
  };
};
