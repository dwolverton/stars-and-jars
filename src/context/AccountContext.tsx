import { getDocs } from "firebase/firestore";
import { orderedParticipantsRef } from "../firebase/firestore";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Account, { BLANK_ACCOUNT } from "../model/Account";

const accountId = import.meta.env.VITE_ACCOUNT_ID;

const AccountContext = createContext(BLANK_ACCOUNT);

export function AccountContextProvider({children}: { children: ReactNode }) {
  const [account, setAccount] = useState(BLANK_ACCOUNT);
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
  const account:Account = {
    id: accountId,
    participants: [],
    participantsById: {}
  };
  const participantsSnapshot = await getDocs(orderedParticipantsRef(accountId));
  console.log(participantsSnapshot)
  participantsSnapshot.forEach(participantDoc => {
    const participant = JSON.parse(participantDoc.data().data);
    participant.id = participantDoc.id;
    account.participants.push(participant);
    account.participantsById[participant.id] = participant;
  });
  return account;
}