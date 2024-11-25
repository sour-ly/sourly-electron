import { useEffect } from 'react';
import { Authentication } from '../../api/auth';
import { Button } from '../components/Button';
import Input from '../components/Input';
import './styles/login.scss';
import { useNavigate } from 'react-router-dom';
import { useWindow } from '../App';

export function OfflinePopup() {
  return (
    <div className="popup__content">
      <p>Using Sourly in offline mode will disable all network features, such as syncing, sharing, social features, and more.</p>
      <p>You are able to transfer this offline profile to an online profile at any time.</p>
    </div>
  )
}

export function Login() {

  const navigation = useNavigate();
  const ctx = useWindow();

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
    ctx.popUp.open({
      type: 'dialog',
      content: OfflinePopup,
      title: 'Offline Mode',
      options: {
        onOkay: () => {
          Authentication.offlineMode(() => {
            navigation('/');
            ctx.popUp.close();
          })
        },
        onCancel: () => {
          ctx.popUp.close();
        },
      }
    });
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
