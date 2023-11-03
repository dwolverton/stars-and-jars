import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import StarIcon from '@mui/icons-material/StarBorder';
import { serverTimestamp } from 'firebase/firestore';
import { useStarsAndJarsContext } from '../context/StarsAndJarsContext';

const BLANK_INFO = {
  participant: {
    name: "",
    labels: []
  },
  value: 1
}

function AddStarDialog({ onClose, info, open }) {
  info = info ?? BLANK_INFO;
  const { participant, value } = info;
  const { addStar } = useStarsAndJarsContext();

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (label) => {
    const star = {
      label: label.text,
      jarType: label.jarType,
      value: value,
      jar: null,
      collected: value <= 0,
      createdAt: serverTimestamp()
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

// SimpleDialog.propTypes = {
//   onClose: PropTypes.func.isRequired,
//   open: PropTypes.bool.isRequired,
//   selectedValue: PropTypes.string.isRequired,
// };

// function SimpleDialogDemo() {
//   const [open, setOpen] = React.useState(false);
//   const [selectedValue, setSelectedValue] = React.useState(emails[1]);

//   const handleClickOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = (value) => {
//     setOpen(false);
//     setSelectedValue(value);
//   };

//   return (
//     <div>
//       <Typography variant="subtitle1" component="div">
//         Selected: {selectedValue}
//       </Typography>
//       <br />
//       <Button variant="outlined" onClick={handleClickOpen}>
//         Open simple dialog
//       </Button>
//       <SimpleDialog
//         selectedValue={selectedValue}
//         open={open}
//         onClose={handleClose}
//       />
//     </div>
//   );
// }