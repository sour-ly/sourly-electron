import { useEffect, useState } from 'react';
import { Authentication } from '../../api/auth';
import { Button } from '../components/Button';
import Input from '../components/Input';
import './styles/signup.scss';
import { useNavigate } from 'react-router-dom';
import { useStateUtil } from '../util/state';
import { useWindow } from '../App';
import { Link } from '../util/link';
import { APITypes } from '../../api/api';

export function Signup() {
  const navigation = useNavigate();
  const [state, setState] = useState({
    username: '',
    password: '',
    email: '',
    'email-copy': '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
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

    let empties: string[] = [];
    Object.keys(state).forEach((key) => {
      type keyType = keyof typeof state;
      const val = state[key as keyType];
      if (val === '') {
        if (key == 'email-copy') {
          empties.push('Verify Email');
          return;
        }
        empties.push(key);
      }
    });

    if (empties.length > 0) {
      ctx.popUp.open({
        type: 'dialog',
        title: 'Error',
        content: () => (<p>{empties.map(o => `${o.at(0)?.toUpperCase()}${o.slice(1)}`).join(', ')} cannot be empty</p>),
        options: { onOkay: () => ctx.popUp.close(), onCancel: () => ctx.popUp.close() }
      });
      return;
    }

    if (state.email !== state['email-copy']) {
      ctx.popUp.open({
        type: 'dialog',
        title: 'Error',
        content: () => (<p>Emails do not match</p>),
        options: { onOkay: () => ctx.popUp.close(), onCancel: () => ctx.popUp.close() }
      });
      return;
    }
    setLoading(true);
    Authentication.signup(state).then((success: APITypes.User | APITypes.APIError) => {
      if ("error" in success) {
        ctx.popUp.open({
          type: 'dialog',
          title: 'Error',
          content: () => (<p>{success.message}</p>),
          options: { onOkay: () => ctx.popUp.close(), onCancel: () => ctx.popUp.close() }
        });
      } else {
        ctx.popUp.open({
          type: 'dialog',
          title: 'HAHA. YES... YES!',
          content: () => (<p>Thank you for signing up! Please check your email to verify your account and to get started!</p>),
          options: { onOkay: () => { navigation('/login'); ctx.popUp.close(); }, onCancel: () => { navigation('/login'); ctx.popUp.close(); } }
        });
      }
    }).finally(() => { setLoading(false) });
  }

  return (
    <main className="signup">
      <div className={`signup__container card ${loading && 'card-loading'}`}>
        <h1>Signup to use Sourly!</h1>
        <p>If you don't have an account, please sign up to continue</p>
        <div className="signup__container__inputs">
          <Input label="Username" placeholder="Username" onChange={e => change('username', e.currentTarget.value)} />
          <Input label="Password" placeholder="Password" type="password" onChange={e => change('password', e.currentTarget.value)} />
          <Input label="Email" type="email" placeholder="Email" onChange={e => change('email', e.currentTarget.value)} />
          <Input label="Verify Email" type="email" placeholder="Verify Email" onChange={e => change('email-copy', e.currentTarget.value)} />
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
