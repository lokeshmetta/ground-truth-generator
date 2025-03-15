import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// If you're using React Router, update your router configuration:
import { BrowserRouter } from 'react-router-dom';

// Change this:
<BrowserRouter>
  <App />
</BrowserRouter>

// To this:
<BrowserRouter basename="/ground-truth-generator">
  <App />
</BrowserRouter>
