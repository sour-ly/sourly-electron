import { useEffect, useState } from "react";
import { sourlysettings } from "..";
import { Settings } from "../settings/settings";

export default function useSettings() {
  const settings = sourlysettings;
  const [settings_copy, setSettings] = useState<Settings>(settings);

  useEffect(() => {
    const i = settings.on('onUpdate', (settings) => {
      setSettings(settings);
    });
    return () => {
      settings.off('onUpdate', i);
    }
  }, [])

  useEffect(() => {
    settings.setAll(settings_copy);
  }, [settings_copy])

  return [settings_copy, setSettings] as const;
}
