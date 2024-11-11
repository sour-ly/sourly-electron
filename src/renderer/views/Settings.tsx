import { environment } from "..";


type CheckboxProps = {
  state: boolean;
  onChange: (state: boolean) => void;
  label: string;
}

function Checkbox({ state, onChange, label }: CheckboxProps) {
  return (
    <label className="checkbox">
      <input type="checkbox" checked={state} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function Settings() {

  return (
    <main className="settings">
      <h1>Settings</h1>
      <div className="settings__content">
        <p style={{ marginTop: '.3rem' }}>Version: v{environment.version}</p>
        <Checkbox state={true} onChange={(state) => { }} label="Disable Notification Alerts" />
      </div>
    </main>
  )

}

export default Settings;
