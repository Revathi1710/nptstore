import React from 'react'
import { Navigate, Outlet } from 'react-router'
import { useStateContext } from '../contexts/ContextProvider'
const DefaultLayout = () => {
    const {user,token}=useStateContext;
    if(!token)
    {
      return   <Navigate to={'/login'}/>
    }
  return (
    <div  id="defaultLayout">
      <div className='context'>
       
        <Outlet/>
      </div>
    </div>
  )
}

export default DefaultLayout
