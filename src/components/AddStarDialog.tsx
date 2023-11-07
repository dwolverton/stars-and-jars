import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import StarIcon from '@mui/icons-material/StarBorder';
import { Timestamp, serverTimestamp } from 'firebase/firestore';
import { useStarsAndJarsContext } from '../context/StarsAndJarsContext';
import { Label, Participant } from '../model/Account';
import Star from '../model/Star';

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
  participant: {
    id: "",
    name: "",
    labels: [],
    jarTypes: []
  },
  value: 1
}

function AddStarDialog({ onClose, info, open }: Props) {
  info = info ?? BLANK_INFO;
  const { participant, value } = info;
  const { addStar } = useStarsAndJarsContext();

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (label: Label) => {
    const star: Star = {
      label: label.text,
      jarType: label.jarType,
      value: value,
      jar: null,
      collected: value <= 0,
      createdAt: serverTimestamp() as Timestamp
    }
    addStar(participant.id, star);
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      {participant && <>
      <DialogTitle>Star for {participant.name}</DialogTitle>
      <List sx={{ pt: 0 }}>
        {participant.labels.map((label) => (
          <ListItem disableGutters key={label.text + label.jarType}>
            <ListItemButton onClick={() => handleListItemClick(label)}>
                <ListItemIcon>
                  <StarIcon />
                </ListItemIcon>
              <ListItemText primary={label.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      </>}
    </Dialog>
  );
}

export default AddStarDialog;