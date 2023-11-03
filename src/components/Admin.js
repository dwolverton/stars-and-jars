import { Box, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from '@mui/material'
import { useState } from 'react'
import { useAccountContext } from '../context/AccountContext'
import StarIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStarsAndJarsContext } from '../context/StarsAndJarsContext';
import AddStarDialog from './AddStarDialog';

export default function Admin() {
  const { participants } = useAccountContext();
  const { getStarsAndJars } = useStarsAndJarsContext();
  const [ newStarInfo, setNewStarInfo ] = useState(null);

  function closeAddStarDialog() {
    setNewStarInfo(null);
  }

  return (
    <div>
      <Box
      sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper' }} >
      <List>
        {Object.values(participants).map(participant => (
          <>
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
              <ListItem secondaryAction={
                <IconButton edge="end" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemIcon>
                  <StarIcon />
                </ListItemIcon>
                <ListItemText primary={star.label} />
              </ListItem>
            ))}
          </>
        ))}
      </List>
      </Box>

      <AddStarDialog open={newStarInfo !== null} info={newStarInfo} onClose={closeAddStarDialog}/>
    </div>
  )
}
