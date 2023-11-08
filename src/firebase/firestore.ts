import { collection, doc, query, where, orderBy, limit } from "firebase/firestore"; 
import { db } from './index';

export function participantsRef(accountId: string) {
  return collection(db, "accounts", accountId, "participants");
}

export function orderedParticipantsRef(accountId: string) {
  return query(participantsRef(accountId), orderBy("order"));
}

export function participantRef(accountId: string, participantId: string) {
  return doc(db, "accounts", accountId, "participants", participantId);
}

export function starsRef(accountId: string, participantId: string) {
  return collection(db, "accounts", accountId, "participants", participantId, "stars");
}

export function starRef(accountId: string, participantId: string, starId: string) {
  return doc(db, "accounts", accountId, "participants", participantId, "stars", starId);
}

export function recentStarsRef(accountId: string, participantId: string) {
  return query(starsRef(accountId, participantId), orderBy("createdAt", "desc"), limit(5));
}

export function unjarredStarsRef(accountId: string, participantId: string) {
  return query(starsRef(accountId, participantId), where("jar", "==", null));
}

export function jarsRef(accountId: string, participantId: string) {
  return collection(db, "accounts", accountId, "participants", participantId, "jars");
}