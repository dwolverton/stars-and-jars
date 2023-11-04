import { useParams } from "react-router-dom";
import { useAccountContext } from "../context/AccountContext";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import jarSvg from "../images/jar.svg";
import { useEffect, useState } from "react";

export function ParticipantHome() {
  const account = useAccountContext();

  const { participantId } = useParams();
  const participant = account.participantsById[participantId];
  const [ selectedJar, setSelectedJar ] = useState({});

  useEffect(() => {
    setSelectedJar(participant ? participant.jarTypes[0] : {});
  }, [ participant ]);

  if (!participant) {
    return <div>Not found: {participantId}</div>;
  }

  return (
    <div>
      {participant.name}

      <div>
        <img src={jarSvg} height={240} alt={`${selectedJar.name} jar`}/>
      </div>

      <BottomNavigation showLabels value={selectedJar} onChange={(e, newValue) => setSelectedJar(newValue)}>
        {participant.jarTypes.map(jarType => (
          <BottomNavigationAction value={jarType} label={jarType.name} icon={<img src={jarSvg} height={24} alt="jar" />} />
        ))}
      </BottomNavigation>
    </div>
  );
}