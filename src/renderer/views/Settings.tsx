import { environment } from "..";

function Settings() {

  return (
    <main className="settings">
      <h1>Settings</h1>
      <div className="settings__content">
        <p>Version: v{environment.version}</p>
      </div>
    </main>
  )

}

export default Settings;
