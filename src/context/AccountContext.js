import { getDocs } from "firebase/firestore";
import { orderedParticipantsRef } from "../firebase/firestore";
import { createContext, useContext, useState, useEffect } from 'react';

const INITIAL_VALUE = {
  participants: [],
  participantsById: {}
}

const AccountContext = createContext(INITIAL_VALUE);

export function AccountContextProvider({children}) {
  const [account, setAccount] = useState(INITIAL_VALUE);
  useEffect(() => {
    fetchAccountDetails().then(setAccount);
  }, []);

  return (
    <AccountContext.Provider value={account}>{children}</AccountContext.Provider>
  );
}

export const useAccountContext = () => useContext(AccountContext);

export default AccountContext;

async function fetchAccountDetails() {
  const accountId = "Ogff6oAlqrQ5nRPO4dJG";
  const account = {
    id: accountId,
    participants: [],
    participantsById: {}
  };
  const participantsSnapshot = await getDocs(orderedParticipantsRef(accountId));
  participantsSnapshot.forEach(participantDoc => {
    const participant = JSON.parse(participantDoc.data().data);
    participant.id = participantDoc.id;
    account.participants.push(participant);
    account.participantsById[participant.id] = participant;
  });
  return account;
}