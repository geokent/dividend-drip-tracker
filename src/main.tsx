import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx: Starting app initialization');

try {
  const rootElement = document.getElementById("root");
  console.log('Main.tsx: Root element found:', !!rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  console.log('Main.tsx: React root created');
  
  root.render(<App />);
  console.log('Main.tsx: App rendered successfully');
} catch (error) {
  console.error('Main.tsx: Failed to initialize app:', error);
  
  // Fallback for mobile issues
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>Loading Issue Detected</h1>
        <p>Please refresh the page or try a different browser.</p>
        <p>Error: ${error.message}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px;">
          Refresh Page
        </button>
      </div>
    `;
  }
}
