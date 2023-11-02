import { Box, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from '@mui/material'
import React from 'react'
import { useAccountContext } from '../context/AccountContext'
import StarIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStarsAndJarsContext } from '../context/StarsAndJarsContext';

export default function Admin() {
  const { participants } = useAccountContext();
  const getStarsAndJars = useStarsAndJarsContext();

  return (
    <div>
      <Box
      sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper' }} >
      <List>
        {Object.values(participants).map(participant => (
          <>
            <ListSubheader>{participant.name}
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete">
                    <RemoveIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" sx={{ml: 1}}>
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


    </div>
  )
}
