import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { jarsRef, starRef } from "./firestore";
import { db } from ".";
import { JarType } from "../model/Account";
import Star from "../model/Star";

export async function repoCollectJar(accountId: string, participantId: string, jarType: JarType, unjarredStars: Star[]) {
  if (!accountId || !participantId || !jarType || !jarType.id) {
    return;
  }
  const starsForThisJar: Star[] = [];
  const stars = unjarredStars.filter(star => star.jarType === jarType.id && star.collected);
  // sort negative values first then sort by createdAt ascending
  stars.sort((a, b) => {
    const valueDiff = a.value - b.value;
    if (valueDiff !== 0) {
      return valueDiff;
    }
    return Number(a.createdAt) - Number(b.createdAt);
  });
  let remaining = jarType.size;
  for (const star of stars) {
    remaining -= star.value;
    starsForThisJar.push(star);
    if (remaining <= 0) {
      break;
    }
  }
  if (remaining > 0) {
    return; // not enough stars to earn jar
  }

  const jar = doc(jarsRef(accountId, participantId)); // create jar ID
  try {
    await runTransaction(db, async (transaction) => {
      const starPromises = [];
      for (const star of starsForThisJar) {
        starPromises.push(transaction.get(starRef(accountId, participantId, star.id!)));
      }
      const starDocs = await Promise.all(starPromises);
      for (const star of starDocs) {
        if (!star || star.data()!.jar !== null) {
          throw "star already used";
        }
        transaction.update(star.ref, { jar: jar.id });
      }
      transaction.set(jar, {
        createdAt: serverTimestamp(),
        jarType: jarType.id,
        prize: null,
        redeemedAt: null
      });
    });
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
}