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
  const [ starTransitioning, setStarTransitioning ] = useState(false);

  const { participantId = "" } = useParams();
  const participant = account.participantsById[participantId];

  useEffect(() => {
    setSelectedJar(participant ? participant.jarTypes[0] : BLANK_JAR_TYPE);
  }, [ participant ]);

  if (!participant) {
    return <div>Not found: {participantId}</div>;
  }

  const jarStats = getJarStats(participantId, selectedJar.id)
  const jarFill = (jarStats && jarStats.collected > 0) ? Math.min(jarStats.collected / selectedJar.size * 100, 100) : 0;
  const jarFull = (jarStats && selectedJar.size) ? jarStats.collected >= selectedJar.size : false;

  let nextStar: Star|null = null;
  let nextStars: Star[] = [];
  if (jarStats.uncollected !== 0) {
    nextStars = getStarsAndJars(participantId).unjarredStars.filter(star => star.jarType === selectedJar.id && !star.collected);
    nextStar = nextStars.shift() ?? null;
    if (nextStars.length > 5) {
      nextStars = nextStars.slice(0, 5);
    }
  }

  const navigationJars = participant.jarTypes.filter(jarType => jarType.enabled);

  function handleCollectStar() {
    setStarTransitioning(true);
    collectStar(participantId, nextStar?.id);
    setTimeout(() => {
      setStarTransitioning(false);
    }, 500);
  }
  
  return (
    <div className="ParticipantHome">
      <Stack sx={{alignItems: 'center', mb: 1}}>
        <div className="nextStarContainer">
          { starTransitioning ?
              <img src={starSvg} alt="new star" className="fallingStar" /> :
          nextStar ? (
            <Button onClick={handleCollectStar} disabled={jarFull} className="nextStarButton">
              <Stack className="nextStar">
              <img src={starSvg} alt="star"/>
              {nextStar.label}
              </Stack>
            </Button>
          ) : "Done for now!"}
          <div className="nextStarsContainer">
            { nextStars.map(star => {
              return (
                <img key={star.id!} src={starSvg} alt="star"/>
              )
            })}
          </div>
        </div>
        <ButtonBase disabled={!jarFull} onClick={() => collectJar(participantId, selectedJar)} className="collectJarButton">
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
        {navigationJars.map(jarType => (
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