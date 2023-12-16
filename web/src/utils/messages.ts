import { Session } from "../types";

export const progressMessage = (session: Session) => {
  if (session.progress === 1) {
    return "aborted";
  }
  if (session.progress === 6) {
    return "expired";
  }
  if (session.progress === 2) {
    if (session.pair.pitcher) {
      return `${session.pair.pitcher.name} is waiting for a batter`;
    }
    return `${session.pair.batter?.name} is waiting for a pitcher`;
  }
  if (session.progress === 3) {
    if (!session.didPitcherCommit && !session.didBatterCommit) {
      return `${session.pair.pitcher?.name} is pitching to ${session.pair.batter?.name}`;
    }
    if (session.didPitcherCommit) {
      return `${session.pair.pitcher?.name} is winding up`;
    }
    return `${session.pair.batter?.name} is ready`;
  }
  if (session.progress === 4) {
    if (!session.didPitcherReveal && !session.didBatterReveal) {
      return `Here comes the pitch…`;
    }
    if (session.didPitcherReveal) {
      return `${session.pair.pitcher?.name} reveals`;
    }
    return `${session.pair.batter?.name} reveals`;
  }
  if (session.progress === 5) {
    if (Number(session.outcome) > 1 && Number(session.outcome) < 6) {
      return `A hit! ${session.pair.batter?.name} wins it for the home team`;
    }
    if (Number(session.outcome) === 1) {
      return `Ball four! ${session.pair.batter?.name}’s eye has tied the game for the home team`;
    }
    if (Number(session.outcome) === 6) {
      return `${session.pair.pitcher?.name} secures the win for the visitors`;
    }
    return `Strike three! ${session.pair.pitcher?.name} wins it for the visitors `;
  }
};

export const getPitchDescription = (s: number, h: number, v: number) => {
  const isStrike = h === 0 || h === 4 || v === 4 || v === 0 ? "A ball" : "A strike";
  const speed = s === 0 ? "Fast" : "Slow";
  let point = "";
  if (v < 2) {
    point = h < 2 ? ", high and inside" : h === 2 ? " and high" : ", high and outside";
  }
  if (v === 2) {
    point = h < 2 ? " and inside" : h === 2 ? " and down the middle" : " and outside";
  }
  if (v > 2) {
    point = h < 2 ? ", low and inside" : h === 2 ? " and low" : ", low and outside";
  }
  return `${isStrike}: ${speed}${point}.`;
};

export const getSwingDescription = (k: number, h: number, v: number) => {
  if (k === 2) {
    return "Nope. You are taking the pitch.";
  }
  const kind = k === 0 ? "For contact" : "For power";
  let point = "";
  if (v < 2) {
    point = h < 2 ? "high and inside" : h === 2 ? "high" : "high and outside";
  }
  if (v === 2) {
    point = h < 2 ? "inside" : h === 2 ? "down the middle" : "outside";
  }
  if (v > 2) {
    point = h < 2 ? "low and inside" : h === 2 ? "low" : "low and outside";
  }
  return `${kind}; ${point}.`;
};
