import { useParams } from "react-router-dom";
import { useAccountContext } from "../context/AccountContext";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import jarSvg from "../images/jar.svg";
import { useEffect, useState } from "react";
import "./ParticipantHome.css";
import { useStarsAndJarsContext } from "../context/StarsAndJarsContext";

export function ParticipantHome() {
  const account = useAccountContext();
  const { getStarsAndJars, getJarStats } = useStarsAndJarsContext();

  const { participantId } = useParams();
  const participant = account.participantsById[participantId];
  const [ selectedJar, setSelectedJar ] = useState({});

  useEffect(() => {
    setSelectedJar(participant ? participant.jarTypes[0] : {});
  }, [ participant ]);

  if (!participant) {
    return <div>Not found: {participantId}</div>;
  }

  const jarStats = getJarStats(participantId, selectedJar.id)
  const jarFill = jarStats ? jarStats.uncollected / selectedJar.size * 100 : 0;
  
  return (
    <div className="ParticipantHome">
      {participant.name}

      <div className="jarContainer" style={{height: '240px', width: '143.14px'}}>
        <div className="jarFill" style={{height: `${jarFill}%`, backgroundColor: selectedJar.color}}></div>
        <img className="jarImg" src={jarSvg} height={240} alt={`${selectedJar.name} jar`}/>
        <div className="jarStats">
          <span className="jarStats-collected">{jarStats.uncollected}</span>
          <span>of {selectedJar.size}</span>
        </div>
      </div>

      <BottomNavigation showLabels value={selectedJar} onChange={(e, newValue) => setSelectedJar(newValue)}>
        {participant.jarTypes.map(jarType => (
          <BottomNavigationAction key={jarType.id} value={jarType} label={jarType.name} icon={<img src={jarSvg} height={24} alt="jar" />} />
        ))}
      </BottomNavigation>
    </div>
  );
}