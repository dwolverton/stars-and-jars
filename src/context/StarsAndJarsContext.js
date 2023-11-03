import { onSnapshot, addDoc } from "firebase/firestore";
import { recentStarsRef, starsRef } from "../firebase/firestore";
import { createContext, useContext, useState, useEffect } from 'react';
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
        unsubscribers.push(loadRecentStars(account.id, participant.id, setter(setValue, participant.id, "recentStars")));
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

  function addStar(participantId, star) {
    if (!account || !participantId) {
      return;
    }
    addDoc(starsRef(account.id, participantId), star);
  }

  console.log(value);
  return (
    <StarsAndJarsContext.Provider value={{
      getStarsAndJars,
      addStar
    }}>{children}</StarsAndJarsContext.Provider>
  );
}

export const useStarsAndJarsContext = () => useContext(StarsAndJarsContext);

export default StarsAndJarsContext;

function setter(setValue, participantId, prop) {
  return newValue => {
    setValue(prev => ({ ...prev, [participantId]: { ...prev[participantId], [prop]: newValue}}));
  }
}

function loadRecentStars(accountId, participantId, set) {
  return onSnapshot(recentStarsRef(accountId, participantId), (querySnapshot) => {
    set(docsToObjs(querySnapshot));
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