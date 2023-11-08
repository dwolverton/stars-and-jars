import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from '@mui/material'
import React, { useState } from 'react'
import { useAccountContext } from '../context/AccountContext'
import StarUncollectedIcon from '@mui/icons-material/StarBorder';
import StarCollectedIcon from '@mui/icons-material/StarSharp';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStarsAndJarsContext } from '../context/StarsAndJarsContext';
import AddStarDialog, { NewStarInfo } from './AddStarDialog';
import { formatTimestamp } from '../util/date-utils';

export default function Admin() {
  const { participants } = useAccountContext();
  const { getStarsAndJars, removeStar } = useStarsAndJarsContext();
  const [ newStarInfo, setNewStarInfo ] = useState<NewStarInfo|null>(null);

  function closeAddStarDialog() {
    setNewStarInfo(null);
  }

  return (
    <div>
      <List>
        {Object.values(participants).map(participant => (
          <React.Fragment key={participant.id}>
            <ListSubheader>{participant.name}
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete"
                              onClick={() => setNewStarInfo({participant, value: -1})}>
                    <RemoveIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="add" sx={{ml: 1}}
                              onClick={() => setNewStarInfo({participant, value: 1})}>
                    <AddIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListSubheader>
            {getStarsAndJars(participant.id).recentStars.map(star => {
              const jarType = participant.jarTypesById[star.jarType];
              return (
              <ListItem key={star.id} secondaryAction={
                <IconButton edge="end" aria-label="delete"
                            onClick={() => removeStar(participant.id, star.id!)}>
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemIcon>
                  {star.collected ? <StarCollectedIcon /> : <StarUncollectedIcon />}
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
