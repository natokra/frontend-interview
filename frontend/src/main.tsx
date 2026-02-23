import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TodoProvider } from './context/TodoContext.tsx'
import { ModalProvider } from './context/ModalContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { LocalStorageProvider } from './context/LocalStorageContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalStorageProvider>
      <ThemeProvider>
        <TodoProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </TodoProvider>
      </ThemeProvider>
    </LocalStorageProvider>
  </StrictMode>,
)
