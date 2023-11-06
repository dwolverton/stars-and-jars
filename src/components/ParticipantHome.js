import { useParams } from "react-router-dom";
import { useAccountContext } from "../context/AccountContext";
import { Badge, BottomNavigation, BottomNavigationAction, Button, ButtonBase, Stack } from "@mui/material";
import jarSvg from "../images/jar.svg";
import starSvg from "../images/star.svg";
import { useEffect, useState } from "react";
import "./ParticipantHome.css";
import { useStarsAndJarsContext } from "../context/StarsAndJarsContext";
import TrophyIcon from '@mui/icons-material/EmojiEventsOutlined';

export function ParticipantHome() {
  const account = useAccountContext();
  const { getStarsAndJars, getJarStats, collectStar, collectJar } = useStarsAndJarsContext();

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
  const jarFill = (jarStats && jarStats.collected > 0) ? jarStats.collected / selectedJar.size * 100 : 0;
  const jarFull = (jarStats && selectedJar.size) ? jarStats.collected >= selectedJar.size : false;

  let nextStar = null;
  if (jarStats.uncollected !== 0) {
    nextStar = getStarsAndJars(participantId).unjarredStars.find(star => star.jarType === selectedJar.id && !star.collected) ?? null;
  }
  
  return (
    <div className="ParticipantHome">
      <Stack sx={{alignItems: 'center', mb: 1}}>
        <div className="nextStarContainer">
          {nextStar ? (
            <Button onClick={() => collectStar(participantId, nextStar.id)} disabled={jarFull} className="nextStarButton">
              <Stack className="nextStar">
              <img src={starSvg} height={40} alt="star"/>
              {nextStar.label}
              </Stack>
            </Button>
          ) : "Done for now!"}
        </div>
        <ButtonBase disabled={!jarFull} onClick={() => collectJar(participantId, selectedJar)}>
        <div className="jarContainer" style={{height: '240px', width: '143.14px'}}>
          <div className="jarFill" style={{height: `${jarFill}%`, backgroundColor: selectedJar.color}}></div>
          <img className="jarImg" src={jarSvg} height={240} alt={`${selectedJar.name} jar`}/>
          { jarFull ? 
            <div className="collectJar">
              <span>Jar is full!</span>
              <span>Tap to collect!</span>
            </div>
            :
            <div className="jarStats">
              <span className="jarStats-collected">{jarStats.collected}</span>
              <span>of {selectedJar.size}</span>
            </div>
          }
        </div>
        </ButtonBase>
      </Stack>
      <BottomNavigation showLabels value={selectedJar} onChange={(e, newValue) => setSelectedJar(newValue)}>
        {participant.jarTypes.map(jarType => (
          <BottomNavigationAction key={jarType.id} value={jarType} label={jarType.name} icon={
            <Badge color="primary" badgeContent={getJarStats(participantId, jarType.id).uncollected}>
              <img src={jarSvg} height={24} alt="jar" style={{backgroundColor: jarType.color}}/>
            </Badge>
          } />
        ))}
        <BottomNavigationAction value="myJars" label="Prizes" icon={
          <Badge color="primary" badgeContent={getStarsAndJars(participantId).unredeemedJars.length}>
            <TrophyIcon />
          </Badge>
        } />
      </BottomNavigation>
    </div>
  );
}