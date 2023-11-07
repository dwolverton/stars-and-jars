import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css'
import { AccountContextProvider } from './context/AccountContext.tsx';
import { StarsAndJarsContextProvider } from './context/StarsAndJarsContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccountContextProvider>
      <StarsAndJarsContextProvider>
        <App />
      </StarsAndJarsContextProvider>
    </AccountContextProvider>
  </React.StrictMode>,
)
