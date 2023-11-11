import { onSnapshot, addDoc, deleteDoc, updateDoc, DocumentSnapshot, QuerySnapshot, serverTimestamp } from "firebase/firestore";
import { recentStarsRef, starsRef, starRef, unjarredStarsRef, orderedJarsRef, jarRef } from "../firebase/firestore";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAccountContext } from "./AccountContext";
import { repoCollectJar } from "../firebase/firebaseRepo";
import Star from "../model/Star";
import Jar from "../model/Jar";
import { JarType } from "../model/Account";

interface StateValue {
  [participantId:string]: ContextParticipant
}
interface ContextParticipant {
  recentStars: Star[],
  unjarredStars: Star[],
  jarStats: { [jarTypeId:number]: ContextJarStats },
  jars: Jar[],
  unredeemedJars: Jar[]
}
interface ContextJarStats {
  unjarred: number;
  collected: number;
  uncollected: number;
}

const INITIAL_VALUE: StateValue = {
}
const BLANK_STATS: ContextJarStats = {
  unjarred: 0,
  collected: 0,
  uncollected: 0
}
const BLANK_PARTICIPANT: ContextParticipant = {
  recentStars: [],
  unjarredStars: [],
  jarStats: {},
  jars: [],
  unredeemedJars: []
}

interface ContextValue {
  getStarsAndJars: (participantId: string) => ContextParticipant,
  getJarStats: (participantId: string, jarType: number) => ContextJarStats,
  addStar: (participantId: string, star: Star) => void,
  removeStar: (participantId: string, starId: string) => void,
  collectStar: (participantId?: string, starId?: string) => void,
  collectJar: (participantId: string, jarType: JarType) => Promise<void>
  redeemJar: (participantId: string, jarId: string, prize: string) => void
}
const DEFAULT_CONTEXT: ContextValue = {
  getStarsAndJars: () => BLANK_PARTICIPANT,
  getJarStats: () => BLANK_STATS,
  addStar: () => {},
  removeStar: () => {},
  collectStar: () => {},
  collectJar: () => Promise.resolve(),
  redeemJar: () => {}
}

const StarsAndJarsContext = createContext(DEFAULT_CONTEXT);

export function StarsAndJarsContextProvider({children}: { children: ReactNode }) {
  const [value, setValue] = useState(INITIAL_VALUE);
  const account = useAccountContext();
  useEffect(() => {
    setValue(INITIAL_VALUE);
    if (account.participants.length !== 0) {
      const newValue: StateValue = {};
      const unsubscribers: (() => void)[] = [];
      for (const participant of account.participants) {
        newValue[participant.id] = BLANK_PARTICIPANT;
        const set = (newValues: object) => {
          setValue(prev => ({ ...prev, [participant.id]: { ...prev[participant.id], ...newValues}}));
        }
        unsubscribers.push(loadRecentStars(account.id, participant.id, set));
        unsubscribers.push(loadUnjarredStars(account.id, participant.id, participant.jarTypes, set));
        unsubscribers.push(loadJars(account.id, participant.id, set));
      }
      setValue(newValue);

      return () => {
        for (const unsubscribe of unsubscribers) {
          unsubscribe();
        }
      }
    }
  }, [account]);

  const getStarsAndJars = useCallback(function getStarsAndJars(participantId: string): ContextParticipant {
    return value[participantId] ?? BLANK_PARTICIPANT;
  }, [ value ]);

  function getJarStats(participantId: string, jarTypeId: number): ContextJarStats {
    const starsAndJars = getStarsAndJars(participantId);
    if (!starsAndJars) {
      return BLANK_STATS;
    } 

    return starsAndJars.jarStats[jarTypeId] ?? BLANK_STATS;
  }

  const addStar = useCallback(function addStar(participantId: string, star: Star) {
    if (!account || !participantId) {
      return;
    }
    addDoc(starsRef(account.id, participantId), star);
  }, [account])

  const removeStar = useCallback(function removeStar(participantId: string, starId: string) {
    if (!account || !participantId || !starId) {
      return;
    }
    deleteDoc(starRef(account.id, participantId, starId));
  }, [account]);

  const collectStar = useCallback(function collectStar(participantId?: string, starId?: string) {
    if (!account || !participantId || !starId) {
      return;
    }
    updateDoc(starRef(account.id, participantId, starId), {collected: true})
  }, [account]);

  const collectJar = useCallback(function collectStar(participantId: string, jarType: JarType) {
    if (!account) {
      return Promise.resolve();
    }
    return repoCollectJar(account.id, participantId, jarType, getStarsAndJars(participantId).unjarredStars);
  }, [account, getStarsAndJars]);

  const redeemJar = useCallback(function redeemJar(participantId:string, jarId: string, prize: string) {
    updateDoc(jarRef(account.id, participantId, jarId), { prize, redeemedAt: serverTimestamp()});
  }, [account]);

  useMemo(() => console.log(value), [value]);
  return (
    <StarsAndJarsContext.Provider value={{
      getStarsAndJars,
      getJarStats,
      addStar,
      removeStar,
      collectStar,
      collectJar,
      redeemJar
    }}>{children}</StarsAndJarsContext.Provider>
  );
}

export const useStarsAndJarsContext = () => useContext(StarsAndJarsContext);

export default StarsAndJarsContext;

function loadRecentStars(accountId: string, participantId: string, set: (values: object) => void) {
  return onSnapshot(recentStarsRef(accountId, participantId), (querySnapshot) => {
    set({ recentStars: docsToObjs(querySnapshot) });
  });
}

function loadUnjarredStars(accountId: string, participantId: string, jarTypes: JarType[], set: (values: object) => void) {
  return onSnapshot(unjarredStarsRef(accountId, participantId), (querySnapshot) => {
    const stars = docsToObjs(querySnapshot);
    const jarStats:{[jarTypeId:number]: ContextJarStats} = {};
    for (const jarType of jarTypes) {
      const jarTypeId = jarType.id;
      const stats = {
        unjarred: 0,
        collected: 0,
        uncollected: 0,
      }
      jarStats[jarTypeId] = stats;
      for (const star of stars) {
        if (star.jarType === jarTypeId) {
          stats.unjarred += star.value;
          if (!star.collected) {
            stats.uncollected += star.value;
          }
        }
      }
      stats.collected = stats.unjarred - stats.uncollected;
    }

    set({
      unjarredStars: stars,
      jarStats
    });
  });
}

function loadJars(accountId: string, participantId: string, set: (values: object) => void) {
  return onSnapshot(orderedJarsRef(accountId, participantId), (querySnapshot) => {
    const jars = docsToObjs(querySnapshot);
    const unredeemedJars = jars.filter(jar => !jar.redeemedAt);
    set({ jars, unredeemedJars });
  });
}

function docToObj(doc: DocumentSnapshot) {
  const obj: any = doc.data();
  obj.id = doc.id;
  return obj;
}

function docsToObjs(docs: QuerySnapshot) {
  const objs: any[] = [];
  docs.forEach(doc => objs.push(docToObj(doc)));
  return objs;
}