import { Timestamp } from "firebase/firestore";

export default interface Jar {
  id?: string;
  jarType: number;
  prize: string | null;
  redeemedAt: Timestamp | null;
  createdAt: Timestamp;
}

export const BLANK_JAR: Jar = {
  jarType: 0,
  prize: null,
  redeemedAt: null,
  createdAt: Timestamp.now()
};