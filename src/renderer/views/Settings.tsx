import { environment } from "..";

function Settings() {

  return (
    <main className="settings">
      <h1>Settings</h1>
      <div className="settings__content">
        <p style={{ marginTop: '.3rem' }}>Version: v{environment.version}</p>
      </div>
    </main>
  )

}

export default Settings;
