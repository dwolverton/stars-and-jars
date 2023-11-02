import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './components/Admin';
import { AccountContextProvider } from './context/AccountContext';
import { StarsAndJarsContextProvider } from './context/StarsAndJarsContext';

function App() {
  return (
    <AccountContextProvider>
      <StarsAndJarsContextProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Admin />} />
            </Routes>
          </div>
        </Router>
      </StarsAndJarsContextProvider>
    </AccountContextProvider>
  );
}

export default App;
