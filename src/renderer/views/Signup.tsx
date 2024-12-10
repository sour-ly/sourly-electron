import { useEffect, useState } from 'react';
import { Authentication } from '../../api/auth';
import { Button } from '../components/Button';
import Input from '../components/Input';
import './styles/signup.scss';
import { useNavigate } from 'react-router-dom';
import { useStateUtil } from '../util/state';
import { useWindow } from '../App';
import { Link } from '../util/link';

export function Signup() {
  const navigation = useNavigate();
  const [state, setState] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
  });
  const change = useStateUtil(setState);
  const ctx = useWindow();

  useEffect(() => {
    const x = async () => {
      const refreshed = await Authentication.refresh();
      if (refreshed) {
        // navigate to the main page
        navigation('/');
      }
    };
    x();
    const z = Authentication.on('loginStateChange', (state) => {
      if (state.state.null) {
        // logged out
        navigation('/login');
      } else {
        // logged in
        navigation('/');
      }
    });

    return () => {
      Authentication.off('loginStateChange', z);
    };

  }, []);


  function signup() {
    Authentication.signup(state).then((success) => {
      if (success) {
        navigation('/login');
      } else {
        ctx.popUp.open({
          type: 'dialog',
          title: 'Error',
          content: () => (<p>There was an error signing up. Please try again.</p>),
          options: { onOkay: () => ctx.popUp.close(), onCancel: () => ctx.popUp.close() }
        });
      }
    });
  }

  return (
    <main className="signup">
      <div className="signup__container card">
        <h1>Signup to use Sourly!</h1>
        <p>If you don't have an account, please sign up to continue</p>
        <div className="signup__container__inputs">
          <Input label="Username" placeholder="Username" onChange={e => change('username', e.currentTarget.value)} />
          <Input label="Password" placeholder="Password" type="password" onChange={e => change('password', e.currentTarget.value)} />
          <Input label="Email" placeholder="Email" onChange={e => change('email', e.currentTarget.value)} />
          <Input label="Name" placeholder="Name" onChange={e => change('name', e.currentTarget.value)} />
        </div>
        <div className="signup__container__links">
          <Button type="solid" onClick={() => { signup() }}>
            Sign Up
          </Button>
          <Button type="outline" onClick={() => Link.NewTab('http://localhost:3000/api/v1/auth/register/google')}>
            Sign Up with Google
          </Button>
        </div>
      </div>
      <p>
        If you would like to use the app in offline mode, go to Login and click
        "Offline Mode"
      </p>
    </main>
  );
}
