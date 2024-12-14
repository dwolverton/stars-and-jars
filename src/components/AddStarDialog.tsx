import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import StarIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import { Timestamp } from 'firebase/firestore';
import { useStarsAndJarsContext } from '../context/StarsAndJarsContext';
import { BLANK_PARTICIPANT, Label, Participant } from '../model/Account';
import Star from '../model/Star';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';

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

  const [ custom, setCustom ] = useState(false);
  const [ customLabel, setCustomLabel ] = useState("");
  const [ customJarType, setCustomJarType ] = useState(String( participant.jarTypes[0]?.id ));
  const [ customValue, setCustomValue ] = useState("1");

  useEffect(() => {
    setCustomJarType(String( participant.jarTypes[0]?.id ));
  }, [participant]);
  useEffect(() => {
    setCustomValue(String(value));
  }, [value]);

  const handleClose = () => {
    setCustom(false);
    setCustomLabel("");
    setCustomJarType(String( participant.jarTypes[0]?.id ));
    setCustomValue(String(value));
    onClose();
  };

  const handleListItemClick = (label: Label) => {
    handleAdd(label.text, label.jarType, value);
  };

  function handleAddCustom(e:FormEvent) {
    e.preventDefault();
    handleAdd(customLabel, parseInt(customJarType), parseInt(customValue));
  }

  function handleAdd(label: string, jarType: number, value: number) {
    const createdAt = new Date();
    if ( date !== 0) {
      createdAt.setDate(createdAt.getDate() + date);
      createdAt.setHours(23, 59, 0, 0);
    }
    if (value > 1 || value < -1) {
      label += ` ${value}`;
    }
    const star: Star = {
      label,
      jarType,
      value,
      jar: null,
      collected: false,
      createdAt: Timestamp.fromDate(createdAt)
    }
    addStar(participant.id, star);
    handleClose();
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      {participant && <>
      <DialogTitle>Star for {participant.name}</DialogTitle>
      { custom ?
        <form onSubmit={handleAddCustom}>
          <Stack sx={{m: 2}}>
          <TextField label="Label" value={customLabel} onChange={e => setCustomLabel(e.target.value)} sx={{mt: 1}} required/>
          <FormControl fullWidth sx={{mt: 1}}>
            <InputLabel id="AddStarDialog-CustomJarType">Jar Type</InputLabel>
            <Select
              labelId="AddStarDialog-CustomJarType"
              value={customJarType}
              label="Jar Type"
              onChange={e => setCustomJarType(e.target.value)}
            >
              { participant.jarTypes.map(jarType => (
                <MenuItem value={jarType.id}><span style={{color: jarType.color}}>⬤</span>&nbsp;{jarType.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Value" type="number" value={customValue} onChange={e => setCustomValue(e.target.value)} sx={{mt: 1}} required />
          <Box sx={{display: "flex", alignItems: "space-between", mt: 1}}>
            <Button onClick={() => setCustom(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
          </Box>
          </Stack>
        </form>
        :
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
          <ListItem disableGutters >
            <ListItemButton dense onClick={() => setCustom(true)}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary="Custom..."/>
            </ListItemButton>
          </ListItem>
        </List>
      }
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