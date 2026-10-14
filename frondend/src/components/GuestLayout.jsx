import React from 'react'
import { useStateContext } from '../contexts/ContextProvider'
import { Navigate, Outlet } from 'react-router'
const GuestLayout = () => {
      const {user,token}=useStateContext;
    if(!token)
    {
      return   <Navigate to='/'/>
    }
  return (
    <>
        <div>
      Guest
    </div>
    <Outlet/>
    </>

  )
}

export default GuestLayout
