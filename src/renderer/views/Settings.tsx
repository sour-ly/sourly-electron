import './styles/settings.scss';
import { useEffect, useState } from "react";
import { environment, sourlysettings } from "..";
import { useStateUtil } from "../util/state";
import { DisplayNumber, NumberInputFilter } from '../input/filter';
import { sDefault } from '../settings/settings';


type CheckboxProps = {
  state: boolean;
  onChange: (state: boolean) => void;
  label: string;
}

function Checkbox({ state, onChange, label }: CheckboxProps) {
  return (
    <label className="checkbox">
      <input type="checkbox" checked={state} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {label}
      </span>
    </label>
  )
}

function NumberInput({ value, onChange, label }: { value: number, onChange: (value: number) => void, label: string }) {

  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (e.target.value === '' || isNaN(value)) {
      onChange(0);
    }
  }

  return (
    <label className="number-input">
      <input type="number" value={DisplayNumber(value, { defaultValue: ' ' })} onChange={(e) => onChange(NumberInputFilter(e.target.value, { min: -1, allowNaN: true }))} onBlur={onBlur} />
      <span>{label}</span>
    </label>
  )
}

function Settings() {

  const settings = sourlysettings;
  const [settings_copy, setSettings] = useState(settings);
  const change = useStateUtil(setSettings);

  useEffect(() => {
    settings.setAll(settings_copy);
  }, [settings_copy])

  return (
    <main className="settings">
      <h1>Settings</h1>
      <div className="settings__content">
        <div className="settings__content__section">
          <p className="label">System Information</p>
          <p style={{ marginTop: '.3rem' }}>Version: v{environment.version}</p>
          <p style={{ marginTop: '.3rem' }}>Mode: {environment.mode}</p>
          <p style={{ marginTop: '.3rem' }}>Platform: {environment.platform}</p>
        </div>
        <div className="settings__content__section">
          <p className="label">Notification Settings</p>
          <Checkbox state={!settings_copy.notification.enabled} onChange={(state) => {
            change('notification', { ...settings_copy.notification, enabled: !state })
          }}
            label="Disable Notification Alerts"
          />
          <NumberInput value={settings_copy.notification.duration / 1000} onChange={(value) => {
            change('notification', { ...settings_copy.notification, duration: value * 1000 })
          }}
            label="Notification Duration"
          />
        </div>
        <button style={{ marginTop: '1rem' }} onClick={() => setSettings({ ...settings_copy, ...sDefault })} className="settings__save">Reset Settings</button>
      </div>
    </main>
  )

}

export default Settings;
