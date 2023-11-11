import './App.css';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Admin from './components/Admin';
import { useAccountContext } from './context/AccountContext';
import { ParticipantHome } from './components/ParticipantHome';
import { AppBar, Toolbar, Button, Container, Box } from '@mui/material';
import Prizes from './components/Prizes';

function App() {
  const account = useAccountContext();
  return (
    <Router>
      <div className="App">
        <Container maxWidth="sm" sx={{px: 0}}>
          <AppBar component="nav" position="static">
            <Toolbar>
              <Button to="/" sx={{ color: '#fff' }} component={NavLink}>Admin</Button>
              {account.participants.map(participant => (
                <Button key={participant.id} to={`/home/${participant.id}`} sx={{ color: '#fff' }} component={NavLink}>{participant.name}</Button>
              ))}
            </Toolbar>
          </AppBar>
          <Box component="main" sx={{ p: 2 }}>
            <Routes>
              <Route path="/" element={<Admin />} />
              <Route path="/home/:participantId/prizes" element={<Prizes/>} />
              <Route path="/home/:participantId" element={<ParticipantHome />} />
            </Routes>
          </Box>
        </Container>
      </div>
    </Router>
  );
}

export default App;
