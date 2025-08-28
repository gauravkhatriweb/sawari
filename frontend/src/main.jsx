import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'  
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { UserProvider } from './context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
    <ToastContainer
      position="top-right"
      autoClose={2500}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastStyle={{
        background: '#111111',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
      bodyStyle={{ fontSize: '0.9rem' }}
    />
  </BrowserRouter>
)
