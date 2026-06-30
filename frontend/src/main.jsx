import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from '@/redux/store'
import { AuthProvider } from '@/lib/auth'
import { CartProvider } from '@/lib/cart'
import { ToastProvider } from '@/lib/toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>,
)

