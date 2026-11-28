import React from 'react'
import Home from './pages/Home'
import { useEffect } from 'react'
import getCurrentUser from './features/getCurrentUser'
import { useDispatch } from 'react-redux'
import { setUserdata } from './redux/userSlice'
function App() {

  const dispatch = useDispatch()
  const [authChecked, setAuthChecked] = React.useState(false)
  useEffect(() => {
    const getUser = async () => {
      const data = await getCurrentUser()
      dispatch(setUserdata(data))
      setAuthChecked(true)
    }
    getUser()
  }, [dispatch])


  if (!authChecked) {
    return <div className="h-screen flex items-center justify-center bg-[#0d0f14] text-sm text-slate-400">Checking your session...</div>
  }

  return (
    <>
      <Home />
    </>
  )
}

export default App
