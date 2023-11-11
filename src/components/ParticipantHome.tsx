import { Link, useParams } from "react-router-dom";
import { useAccountContext } from "../context/AccountContext";
import { Badge, BottomNavigation, BottomNavigationAction, Button, ButtonBase, Stack } from "@mui/material";
import jarSvg from "../assets/jar.svg";
import starSvg from "../assets/star.svg";
import { useEffect, useState } from "react";
import "./ParticipantHome.css";
import { useStarsAndJarsContext } from "../context/StarsAndJarsContext";
import TrophyIcon from '@mui/icons-material/EmojiEventsOutlined';
import { BLANK_JAR_TYPE, JarType } from "../model/Account";
import Star from "../model/Star";

export function ParticipantHome() {
  const account = useAccountContext();
  const { getStarsAndJars, getJarStats, collectStar, collectJar } = useStarsAndJarsContext();
  const [ selectedJar, setSelectedJar ] = useState<JarType>(BLANK_JAR_TYPE);

  const { participantId = "" } = useParams();
  const participant = account.participantsById[participantId];

  useEffect(() => {
    setSelectedJar(participant ? participant.jarTypes[0] : BLANK_JAR_TYPE);
  }, [ participant ]);

  if (!participant) {
    return <div>Not found: {participantId}</div>;
  }

  const jarStats = getJarStats(participantId, selectedJar.id)
  const jarFill = (jarStats && jarStats.collected > 0) ? jarStats.collected / selectedJar.size * 100 : 0;
  const jarFull = (jarStats && selectedJar.size) ? jarStats.collected >= selectedJar.size : false;

  let nextStar: Star|null = null;
  if (jarStats.uncollected !== 0) {
    nextStar = getStarsAndJars(participantId).unjarredStars.find(star => star.jarType === selectedJar.id && !star.collected) ?? null;
  }
  
  return (
    <div className="ParticipantHome">
      <Stack sx={{alignItems: 'center', mb: 1}}>
        <div className="nextStarContainer">
          {nextStar ? (
            <Button onClick={() => collectStar(participantId, nextStar?.id)} disabled={jarFull} className="nextStarButton">
              <Stack className="nextStar">
              <img src={starSvg} alt="star"/>
              {nextStar.label}
              </Stack>
            </Button>
          ) : "Done for now!"}
        </div>
        <ButtonBase disabled={!jarFull} onClick={() => collectJar(participantId, selectedJar)}>
        <div className="jarContainer">
          <div className="jarFill" style={{height: `${jarFill}%`, backgroundColor: selectedJar.color}}></div>
          <img className="jarImg" src={jarSvg} alt={`${selectedJar.name} jar`}/>
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
      <BottomNavigation showLabels value={selectedJar} onChange={(_e, newValue) => setSelectedJar(newValue)}
                        sx={{mt: 2}}>
        {participant.jarTypes.map(jarType => (
          <BottomNavigationAction key={jarType.id} value={jarType} label={jarType.name} icon={
            <Badge color="primary" badgeContent={getJarStats(participantId, jarType.id).uncollected}>
              <img src={jarSvg} height={24} alt="jar" style={{backgroundColor: jarType.color}}/>
            </Badge>
          } />
        ))}
        <BottomNavigationAction label="Prizes" component={Link} to={`/home/${participantId}/prizes`} icon={
          <Badge color="primary" badgeContent={getStarsAndJars(participantId).unredeemedJars.length}>
            <TrophyIcon />
          </Badge>
        } />
      </BottomNavigation>
    </div>
  );
}