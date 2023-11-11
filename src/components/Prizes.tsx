import { useParams } from "react-router-dom";
import { useAccountContext } from "../context/AccountContext";
import { useStarsAndJarsContext } from "../context/StarsAndJarsContext";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import jarSvg from "../assets/jar.svg";
import { formatTimestampWithoutTime } from "../util/date-utils";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import Dialog from "@mui/material/Dialog";
import { FormEvent, useState } from "react";
import Jar from "../model/Jar";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";


export default function Prizes() {
  const account = useAccountContext();
  const { getStarsAndJars, redeemJar } = useStarsAndJarsContext();
  const [ selectedJar, setSelectedJar ] = useState<Jar|null>(null);
  const [ prizeText, setPrizeText ] = useState("");

  const { participantId = "" } = useParams();
  const participant = account.participantsById[participantId];
  if (!participant) {
    return <div>Not found: {participantId}</div>;
  }

  const jars = getStarsAndJars(participantId).jars;

  function closeDialog() {
    setSelectedJar(null);
    setPrizeText("");
  }

  function handleSave(e:FormEvent) {
    e.preventDefault();
    if (selectedJar && prizeText.trim() !== "") {
      redeemJar(participantId, selectedJar.id!, prizeText);
    }
    closeDialog();
  }

  return (
    <div>
    <Typography variant="h4" component="h1">
      {participant.name}'s Prizes
    </Typography>
    
    <List>
      {jars.map(jar => {
        const jarType = participant.jarTypesById[jar.jarType];
        if (!jar.prize) {
          return (
            <ListItem key={jar.id} disableGutters>
              <ListItemButton onClick={() => setSelectedJar(jar)}>
                <ListItemIcon>
                  <img src={jarSvg} height={24} alt="jar" style={{backgroundColor: jarType.color}}/>
                </ListItemIcon>
                <ListItemText primary="Claim prize!" secondary={<>
                  {jarType.name}
                  &nbsp;🕑{formatTimestampWithoutTime(jar.createdAt)}
                  </>}/>
              </ListItemButton>
            </ListItem>
          );
        } else {
          return (
            <ListItem key={jar.id}>
              <ListItemIcon>
                <CheckIcon htmlColor={jarType.color} />
              </ListItemIcon>
              <ListItemText primary={`Prize: ${jar.prize}`} secondary={<>
                {jarType.name}
                &nbsp;🕑{formatTimestampWithoutTime(jar.createdAt)}
                </>}/>
            </ListItem>
          );
        }
      })}
    </List>

    <Dialog onClose={closeDialog} open={selectedJar !== null} component="form" onSubmit={handleSave}>
      <DialogTitle>What is the prize?</DialogTitle>
      <DialogContent>
        <TextField label="Prize" value={prizeText} onChange={e => setPrizeText(e.target.value)} sx={{mt: 1}}/>
      </DialogContent>
      <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button type="submit" variant="contained">Claim</Button>
        </DialogActions>
    </Dialog>
    
    </div>
  )
}
