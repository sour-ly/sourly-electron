import { useEffect } from 'react';
import { Authentication } from '../../api/auth';
import { Button } from '../components/Button';
import Input from '../components/Input';
import './styles/login.scss';
import { useNavigate } from 'react-router-dom';

export function Login() {

  const navigation = useNavigate();

  useEffect(() => {
    const x = async () => {
      const refreshed = await Authentication.refresh();
      if (refreshed) {
        //navigate to the main page
        navigation('/');
      }
    }
    x();
  }, [])

  //switch to offline mode
  function offlineMode() {
    Authentication.offlineMode(() => {
      navigation('/');
    })
  }

  return (
    <main className="login">

      <div className="login__container card">
        <h1>Login To Sourly</h1>
        <p>Welcome to Sourly, please login to continue</p>
        <div className="login__container__inputs">
          <Input label="Username" placeholder="Username" />
          <Input label="Password" placeholder="Password" type="password" />
        </div>
        <div className="login__container__links">
          <Button type="solid" onClick={() => { }}>Login</Button>
          <Button type="outline" onClick={offlineMode}>Offline Mode</Button>
        </div>
      </div>
    </main>
  );
}
