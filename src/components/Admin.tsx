import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from '@mui/material'
import React, { useState } from 'react'
import { useAccountContext } from '../context/AccountContext'
import StarUncollectedIcon from '@mui/icons-material/StarBorder';
import StarCollectedIcon from '@mui/icons-material/StarSharp';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useStarsAndJarsContext } from '../context/StarsAndJarsContext';
import AddStarDialog, { NewStarInfo } from './AddStarDialog';
import { formatTimestamp } from '../util/date-utils';
import Star from '../model/Star';

export default function Admin() {
  const { participants } = useAccountContext();
  const { getStarsAndJars, removeStar } = useStarsAndJarsContext();
  const [ newStarInfo, setNewStarInfo ] = useState<NewStarInfo|null>(null);
  const [ expanded, setExpanded ] = useState(false);

  function closeAddStarDialog() {
    setNewStarInfo(null);
  }

  function getRecentStars(participantId: string): Star[] {
    let stars = getStarsAndJars(participantId).recentStars;
    if (!expanded && stars.length > 5) {
      stars = stars.slice(0, 5);
    }
    return stars;
  }

  return (
    <div>
      <List>
        {Object.values(participants).map(participant => (
          <React.Fragment key={participant.id}>
            <ListSubheader>{participant.name}
                <ListItemSecondaryAction>
                  { expanded ? 
                    <IconButton edge="end" aria-label="show more"
                                onClick={() => setExpanded(false)}>
                      <ExpandLessIcon />
                    </IconButton> :
                    
                    <IconButton edge="end" aria-label="show more"
                                onClick={() => setExpanded(true)}>
                      <ExpandMoreIcon />
                    </IconButton>
                  }
                  <IconButton edge="end" aria-label="delete" sx={{ml: 2}}
                              onClick={() => setNewStarInfo({participant, value: -1})}>
                    <RemoveIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="add" sx={{ml: 2}}
                              onClick={() => setNewStarInfo({participant, value: 1})}>
                    <AddIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListSubheader>
            {getRecentStars(participant.id).map(star => {
              const jarType = participant.jarTypesById[star.jarType];
              return (
              <ListItem key={star.id} secondaryAction={
                <IconButton edge="end" aria-label="delete"
                            onClick={() => removeStar(participant.id, star.id!)}>
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemIcon>
                  {star.value < 0 ? <RemoveIcon/> :
                  star.collected ? <StarCollectedIcon /> : <StarUncollectedIcon />}
                </ListItemIcon>
                <ListItemText primary={star.label} secondary={<>
                  <span style={{color: jarType.color}}>⬤</span> {jarType.name}
                  &nbsp;🕑{formatTimestamp(star.createdAt)}
                  </>}/>
              </ListItem>
            )})}
          </React.Fragment>
        ))}
      </List>

      <AddStarDialog open={newStarInfo !== null} info={newStarInfo} onClose={closeAddStarDialog}/>
    </div>
  )
}
