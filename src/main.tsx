import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

// If the root has pre-rendered content, hydrate; otherwise create fresh
if (rootElement.children.length > 0) {
  hydrateRoot(rootElement, <App />);
} else {
  createRoot(rootElement).render(<App />);
}
