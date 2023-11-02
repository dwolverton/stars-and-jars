import { collection, doc, query, orderBy, limit } from "firebase/firestore"; 
import { db } from './index';

export function participantsRef(accountId) {
  return collection(db, "accounts", accountId, "participants");
}

export function orderedParticipantsRef(accountId) {
  return query(participantsRef(accountId), orderBy("order"));
}

export function participantRef(accountId, participantId) {
  return doc(db, "accounts", accountId, "participants", participantId);
}

export function starsRef(accountId, participantId) {
  return collection(db, "accounts", accountId, "participants", participantId, "stars");
}

export function recentStarsRef(accountId, participantId) {
  console.log(accountId, participantId);
  return query(starsRef(accountId, participantId), orderBy("createdAt", "desc"), limit(10));
}

export function jarsRef(accountId, participantId) {
  return collection(db, "accounts", accountId, "participants", participantId, "jars");
}