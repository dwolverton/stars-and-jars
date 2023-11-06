import { onSnapshot, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { recentStarsRef, starsRef, starRef, unjarredStarsRef, jarsRef } from "../firebase/firestore";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAccountContext } from "./AccountContext";
import { repoCollectJar } from "../firebase/firebaseRepo";

const INITIAL_VALUE = {
}
const BLANK_PARTICIPANT = {
  recentStars: [],
  unjarredStars: [],
  jarStats: {},
  jars: [],
  unredeemedJars: []
}
const BLANK_STATS = {
  unjarred: 0,
  collected: 0,
  uncollected: 0
}

const StarsAndJarsContext = createContext(INITIAL_VALUE);

export function StarsAndJarsContextProvider({children}) {
  const [value, setValue] = useState(INITIAL_VALUE);
  const account = useAccountContext();
  useEffect(() => {
    setValue(INITIAL_VALUE);
    if (account.participants.length !== 0) {
      const newValue = {};
      const unsubscribers = [];
      for (const participant of account.participants) {
        newValue[participant.id] = BLANK_PARTICIPANT;
        const set = setter(setValue, participant.id);
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

  const getStarsAndJars = useCallback(function getStarsAndJars(participantId) {
    return value[participantId] ?? BLANK_PARTICIPANT;
  }, [ value ]);

  function getJarStats(participantId, jarType) {
    const starsAndJars = getStarsAndJars(participantId);
    if (!starsAndJars) {
      return BLANK_STATS;
    } 

    return starsAndJars.jarStats[jarType] ?? BLANK_STATS;
  }

  const addStar = useCallback(function addStar(participantId, star) {
    if (!account || !participantId) {
      return;
    }
    addDoc(starsRef(account.id, participantId), star);
  }, [account])

  const removeStar = useCallback(function removeStar(participantId, starId) {
    if (!account || !participantId || !starId) {
      return;
    }
    deleteDoc(starRef(account.id, participantId, starId));
  }, [account]);

  const collectStar = useCallback(function collectStar(participantId, starId) {
    if (!account || !participantId || !starId) {
      return;
    }
    updateDoc(starRef(account.id, participantId, starId), {collected: true})
  }, [account]);

  const collectJar = useCallback(function collectStar(participantId, jarType) {
    if (!account) {
      return;
    }
    return repoCollectJar(account.id, participantId, jarType, getStarsAndJars(participantId).unjarredStars);
  }, [account, getStarsAndJars]);

  useMemo(() => console.log(value), [value]);
  return (
    <StarsAndJarsContext.Provider value={{
      getStarsAndJars,
      getJarStats,
      addStar,
      removeStar,
      collectStar,
      collectJar
    }}>{children}</StarsAndJarsContext.Provider>
  );
}

export const useStarsAndJarsContext = () => useContext(StarsAndJarsContext);

export default StarsAndJarsContext;

function setter(setValue, participantId) {
  return newValues => {
    setValue(prev => ({ ...prev, [participantId]: { ...prev[participantId], ...newValues}}));
  }
}

function loadRecentStars(accountId, participantId, set) {
  return onSnapshot(recentStarsRef(accountId, participantId), (querySnapshot) => {
    set({ recentStars: docsToObjs(querySnapshot) });
  });
}

function loadUnjarredStars(accountId, participantId, jarTypes, set) {
  return onSnapshot(unjarredStarsRef(accountId, participantId), (querySnapshot) => {
    const stars = docsToObjs(querySnapshot);
    const jarStats = {};
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

function loadJars(accountId, participantId, set) {
  return onSnapshot(jarsRef(accountId, participantId), (querySnapshot) => {
    const jars = docsToObjs(querySnapshot);
    const unredeemedJars = jars.filter(jar => !jar.redeemedAt);
    set({ jars, unredeemedJars });
  });
}

function docToObj(doc) {
  const obj = doc.data();
  obj.id = doc.id;
  return obj;
}

function docsToObjs(docs) {
  const objs = [];
  docs.forEach(doc => objs.push(docToObj(doc)));
  return objs;
}