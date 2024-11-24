//this is a react route that checks if the user is authenticated, if not it will redirect to the login page
//

import { useEffect } from "react";
import { Authentication } from "../../api/auth";
import { Routes, useNavigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {

  const navigation = useNavigate();

  useEffect(() => {
    const x = async () => {
      const refreshed = await Authentication.refresh();
      if (!refreshed) {
        navigation('/login');
      }
    }
    x();

  }, [])


  return (
    <>
      {children}
    </>
  )
}
