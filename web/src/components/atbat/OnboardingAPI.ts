import { AtBatStatus, BatterReveal, PitcherReveal, SessionStatus } from "../../types";

export const selectedToken = {
  address: "0xf40c0961A9CC5c037B92D2cb48167F7f62Dd7cD0",
  id: "2",
  image: "https://static.fullcount.xyz/Beer_League_Ballers/p2.png",
  isStaked: true,
  stakedSessionID: 0,
  tokenProgress: 3,
  name: "newbie",
};

export const dummy = {
  address: "0xf40c0961A9CC5c037B92D2cb48167F7f62Dd7cD0",
  id: "1",
  image: "https://static.fullcount.xyz/Beer_League_Ballers/p1.png",
  isStaked: true,
  stakedSessionID: 0,
  tokenProgress: 3,
  name: "mumintrl",
};

const getPitchOutcome = (pitcherReveal: PitcherReveal, batterReveal: BatterReveal) => {
  const isStrikeZone =
    Number(pitcherReveal.horizontal) > 0 &&
    Number(pitcherReveal.horizontal) < 4 &&
    Number(pitcherReveal.vertical) > 0 &&
    Number(pitcherReveal.vertical) < 4;
  if (batterReveal.kind === "2") {
    return isStrikeZone ? 0 : 1;
  }
  if (
    pitcherReveal.horizontal === batterReveal.horizontal &&
    pitcherReveal.vertical === batterReveal.vertical
  ) {
    return 6;
  }
  return 0;
};

export const getAtBAtOutcome = (pitches: SessionStatus[]) => {
  const balls = pitches.filter((p) => p.outcome === 1).length;
  const strikes = pitches.filter((p) => p.outcome === 0 && p.progress === 5).length;
  let outcome = 0;
  if (pitches[pitches.length - 1].outcome === 6) {
    outcome = 6;
  }
  if (balls === 4) {
    outcome = 2;
  }
  if (strikes === 3) {
    outcome = 1;
  }
  return { balls, strikes, outcome };
};

const emptyPitch = {
  progress: 3,
  outcome: 0,
  sessionID: 0,
  didPitcherCommit: true,
  didBatterCommit: false,
  didPitcherReveal: true,
  didBatterReveal: false,
  pitcherReveal: { nonce: "0", speed: "0", vertical: "0", horizontal: "0" },
  batterReveal: {
    nonce: "0",
    kind: "0",
    vertical: "0",
    horizontal: "0",
  },
  phaseStartTimestamp: String(Math.floor(Date.now() / 1000)),
};

export const initialAtBatState = {
  pitcher: dummy,
  batter: selectedToken,
  balls: 0,
  strikes: 0,
  outcome: 0,
  id: 0,
  pitches: [{ ...emptyPitch }],
  numberOfSessions: 1,
};

type Cell = [number, number];

function findDistantCell(cell: Cell): Cell {
  const [x, y] = cell;
  const distantX = x <= 2 ? 4 : 0;
  const distantY = y <= 2 ? 4 : 0;
  return [distantX, distantY];
}

const getPitch = (swing: BatterReveal, pitchNumber: number) => {
  if (pitchNumber < 2) {
    if (swing.kind === "2") {
      return {
        nonce: "0",
        speed: "0",
        vertical: "2",
        horizontal: "2",
      };
    }
    const [horizontal, vertical] = findDistantCell([
      Number(swing.horizontal),
      Number(swing.vertical),
    ]);
    return {
      nonce: "0",
      speed: "0",
      vertical: String(vertical),
      horizontal: String(horizontal),
    };
  } else {
    if (swing.kind === "2") {
      return {
        nonce: "0",
        speed: "0",
        vertical: String(pitchNumber - 2),
        horizontal: "0",
      };
    }
    return {
      nonce: "0",
      speed: "1",
      vertical: swing.vertical,
      horizontal: swing.horizontal,
    };
  }
};

export const getAtBat = (swings: BatterReveal[], currentState: AtBatStatus) => {
  const newPitches = currentState.pitches.map((p, idx) => {
    if (!p.didBatterReveal && swings[idx]) {
      const batterReveal = swings[idx];
      const pitcherReveal = getPitch(swings[idx], idx);
      return {
        progress: 5,
        outcome: getPitchOutcome(pitcherReveal, batterReveal),
        didBatterReveal: true,
        didPitcherReveal: true,
        didPitcherCommit: true,
        didBatterCommit: true,
        batterReveal,
        pitcherReveal,
        phaseStartTimestamp: "0",
        sessionID: 0,
      };
    }
    return p;
  });

  const { balls, strikes, outcome } = getAtBAtOutcome(newPitches);
  if (newPitches.length === swings.length && outcome === 0) {
    newPitches.push({
      ...emptyPitch,
      phaseStartTimestamp: String(Math.floor(Date.now() / 1000)),
    });
  }
  const numberOfSessions = newPitches.length;
  return {
    ...currentState,
    pitches: newPitches,
    numberOfSessions,
    balls,
    strikes,
    outcome,
  };
};
