import { useEffect } from 'react';
import { Authentication } from '../../api/auth';
import { Button } from '../components/Button';
import Input from '../components/Input';
import './styles/signup.scss';
import { useNavigate } from 'react-router-dom';

export function Signup() {
  const navigation = useNavigate();

  useEffect(() => {
    const x = async () => {
      const refreshed = await Authentication.refresh();
      if (refreshed) {
        // navigate to the main page
        navigation('/');
      }
    };
    x();
  }, []);

  return (
    <main className="signup">
      <div className="signup__container card">
        <h1>Signup to use Sourly!</h1>
        <p>If you don't have an account, please sign up to continue</p>
        <div className="signup__container__inputs">
          <Input label="Username" placeholder="Username" />
          <Input label="Password" placeholder="Password" type="password" />
        </div>
        <div className="signup__container__links">
          <Button type="solid" onClick={() => { }}>
            Sign Up
          </Button>
          <Button type="outline" onClick={() => { }}>
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
