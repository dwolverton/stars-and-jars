import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from '@mui/material'
import React, { useState } from 'react'
import { useAccountContext } from '../context/AccountContext'
import StarIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStarsAndJarsContext } from '../context/StarsAndJarsContext';
import AddStarDialog, { NewStarInfo } from './AddStarDialog';

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
            {getStarsAndJars(participant.id).recentStars.map(star => (
              <ListItem key={star.id} secondaryAction={
                <IconButton edge="end" aria-label="delete"
                            onClick={() => removeStar(participant.id, star.id!)}>
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemIcon>
                  <StarIcon />
                </ListItemIcon>
                <ListItemText primary={star.label} />
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </List>

      <AddStarDialog open={newStarInfo !== null} info={newStarInfo} onClose={closeAddStarDialog}/>
    </div>
  )
}
