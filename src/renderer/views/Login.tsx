import './styles/login.scss';

export function Login() {
  return (
    <main className="login">
      <div className="login__container">
        <h1>Login</h1>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
      </div>
    </main>
  );
}
