import { onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
import { recentStarsRef, starsRef, starRef, unjarredStarsRef } from "../firebase/firestore";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAccountContext } from "./AccountContext";

const INITIAL_VALUE = {
}
const BLANK_PARTICIPANT = {
  recentStars: []
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
        unsubscribers.push(loadRecentStars(account.id, participant.id, setter(setValue, participant.id)));
        unsubscribers.push(loadUnjarredStars(account.id, participant.id, participant.jarTypes, setter(setValue, participant.id)));
      }
      setValue(newValue);

      return () => {
        for (const unsubscribe of unsubscribers) {
          unsubscribe();
        }
      }
    }
  }, [account]);

  function getStarsAndJars(participantId) {
    return value[participantId] ?? BLANK_PARTICIPANT;
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

  useMemo(() => console.log(value), [value]);
  return (
    <StarsAndJarsContext.Provider value={{
      getStarsAndJars,
      addStar,
      removeStar
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
          stats.unjarred++;
          if (!star.collected) {
            stats.uncollected++;
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