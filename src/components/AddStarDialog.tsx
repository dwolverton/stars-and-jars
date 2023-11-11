import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import StarIcon from '@mui/icons-material/StarBorder';
import { Timestamp } from 'firebase/firestore';
import { useStarsAndJarsContext } from '../context/StarsAndJarsContext';
import { BLANK_PARTICIPANT, Label, Participant } from '../model/Account';
import Star from '../model/Star';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState } from 'react';

interface Props {
  onClose: () => void;
  info: NewStarInfo | null;
  open: boolean;
}

export interface NewStarInfo {
  participant: Participant;
  value: number;
}

const BLANK_INFO: NewStarInfo = {
  participant: BLANK_PARTICIPANT,
  value: 1
}

function AddStarDialog({ onClose, info, open }: Props) {
  info = info ?? BLANK_INFO;
  const [ date, setDate ] = useState(0);
  const { participant, value } = info;
  const { addStar } = useStarsAndJarsContext();

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (label: Label) => {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() + date);
    const star: Star = {
      label: label.text,
      jarType: label.jarType,
      value: value,
      jar: null,
      collected: value <= 0,
      createdAt: Timestamp.fromDate(createdAt)
    }
    addStar(participant.id, star);
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      {participant && <>
      <DialogTitle>Star for {participant.name}</DialogTitle>
      <List sx={{ pt: 0 }}>
        {participant.labels.map((label) => {
          const jarType = participant.jarTypesById[label.jarType];
          return (
            <ListItem disableGutters key={label.text + label.jarType}>
              <ListItemButton dense onClick={() => handleListItemClick(label)}  >
                <ListItemIcon>
                  <StarIcon />
                </ListItemIcon>
                <ListItemText primary={label.text} secondary={<>
                    <span style={{color: jarType.color}}>⬤</span> {jarType.name}</>
                }/>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={date}
        onChange={(_e, value) => setDate(value)}
      >
        <ToggleButton value={-2}>2 Days ago</ToggleButton>
        <ToggleButton value={-1}>Yesterday</ToggleButton>
        <ToggleButton value={0}>Today</ToggleButton>
      </ToggleButtonGroup>
      </>}
    </Dialog>
  );
}

export default AddStarDialog;