import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { jarsRef, starRef } from "./firestore";
import { db } from ".";
import { JarType } from "../model/Account";
import Star from "../model/Star";

export async function repoCollectJar(accountId: string, participantId: string, jarType: JarType, unjarredStars: Star[]) {
  if (!accountId || !participantId || !jarType || !jarType.id) {
    return;
  }
  const stars = unjarredStars.filter(star => star.jarType === jarType.id && star.collected);
  // sort negative values first then sort by createdAt ascending
  stars.sort((a, b) => {
    const valueDiff = a.value - b.value;
    if (valueDiff !== 0) {
      return valueDiff;
    }
    return Number(a.createdAt) - Number(b.createdAt);
  });

  const batch = writeBatch(db);
  const jar = doc(jarsRef(accountId, participantId)); // create jar ID
  let remaining = jarType.size;
  for (const star of stars) {
    remaining -= star.value;
    batch.update(starRef(accountId, participantId, star.id!), { jar: jar.id });
    if (remaining <= 0) {
      break;
    }
  }
  if (remaining > 0) {
    return; // not enough stars to earn jar
  }
  batch.set(jar, {
    createdAt: serverTimestamp(),
    jarType: jarType.id,
    prize: null,
    redeemedAt: null
  });

  return batch.commit();
}