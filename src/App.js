import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Admin from './components/Admin';
import { useAccountContext } from './context/AccountContext';
import { ParticipantHome } from './components/ParticipantHome';

function App() {
  const account = useAccountContext();
  return (
    <Router>
      <div className="App">
        {account.participants.map(participant => (
          <Link to={`/home/${participant.id}`}>{participant.name}</Link>
        ))}
        <Routes>
          <Route path="/" element={<Admin />} />
          <Route path="/home/:participantId" element={<ParticipantHome />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
