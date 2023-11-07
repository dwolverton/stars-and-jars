import { Timestamp } from "firebase/firestore";

export default interface Star {
  id?: string;
  label: string;
  jarType: number;
  value: number;
  jar: string | null;
  collected: boolean;
  createdAt: Timestamp;
}

export const BLANK_STAR: Star = {
  label: "",
  jarType: 0,
  value: 1,
  jar: null,
  collected: false,
  createdAt: Timestamp.now()
}