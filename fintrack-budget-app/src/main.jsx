import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BudgetApp from './budget-app.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BudgetApp />
  </StrictMode>,
)
