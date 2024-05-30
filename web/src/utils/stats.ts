import { PitchLocation, SwingLocation, Token } from "../types";
import axios from "axios";
import { FULLCOUNT_API } from "../constants";

export const fetchSwingDistribution = async (token: Token | undefined) => {
  if (!token) {
    return;
  }

  const API_URL = `${FULLCOUNT_API}/swing_distribution`;
  const counts = new Array(25).fill(0);
  try {
    const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
    let takes = 0;
    if (!res.data.swing_distribution) {
      return { counts, rates: counts, takes: 0 };
    }
    res.data.swing_distribution.forEach((l: SwingLocation) => {
      if (l.swing_type === 2) {
        takes += l.count;
      } else {
        counts[l.swing_vertical * 5 + l.swing_horizontal] += l.count;
      }
    });
    const total = counts.reduce((acc, value) => acc + value, 0);
    const rates = counts.map((value) => value / total);
    return { rates, counts, takes };
  } catch (e) {
    console.error("Error fetching swing distribution:", e);
    return { counts, rates: counts, takes: 0 };
  }
};

export const fetchPitchDistribution = async (token: Token | undefined) => {
  if (!token) {
    return;
  }
  const API_URL = `${FULLCOUNT_API}/pitch_distribution`;
  const counts = new Array(25).fill(0);
  try {
    const res = await axios.get(`${API_URL}/${token.address}/${token.id}`);
    if (!res.data.pitch_distribution) {
      return { counts, rates: counts, fast: 0 };
    }
    res.data.pitch_distribution.forEach((l: PitchLocation) => {
      counts[l.pitch_vertical * 5 + l.pitch_horizontal] =
        counts[l.pitch_vertical * 5 + l.pitch_horizontal] + l.count;
    });
    const total = counts.reduce((acc, value) => acc + value);
    const fast = res.data.pitch_distribution.reduce(
      (acc: number, value: { pitch_speed: 0 | 1; count: number }) =>
        acc + (value.pitch_speed === 0 ? value.count : 0),
      0,
    );
    const rates = counts.map((value) => value / total);
    return { rates, counts, fast };
  } catch (e) {
    console.log({ token, e });
    return { counts, rates: counts, fast: 0 };
  }
};

export const fetchBatterStats = async (token: Token) => {
  if (!token) {
    return;
  }
  const API_URL = `${FULLCOUNT_API}/stats`;
  try {
    const stat = await axios.get(`${API_URL}/${token.address}/${token.id}`);
    return stat.data;
  } catch (e) {
    console.log({ token, e });
  }
};

export const fetchPitcherStats = async (token: Token) => {
  if (!token) {
    return;
  }
  const API_URL = `${FULLCOUNT_API}/stats`;
  try {
    const stat = await axios.get(`${API_URL}/${token.address}/${token.id}`);
    return stat.data;
  } catch (e) {
    console.log({ token, e });
  }
};
