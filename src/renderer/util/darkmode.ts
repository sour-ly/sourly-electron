import { sourlysettings } from "..";

function getWindow() {
  if (typeof window !== 'undefined') {
    return window;
  }
  throw new Error('Window is not defined, this function should only be called on the client side');
}

function getDarkModeFromSystem() {
  return getWindow().matchMedia('(prefers-color-scheme: dark)').matches;
}

export function isDarkMode() {
  const settings = sourlysettings
  return settings.theme === 'dark' || getDarkModeFromSystem();
}

export function adjustTheme() {
  const settings = sourlysettings;
  if (settings.theme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
}

export function toggleDarkMode() {
  const settings = sourlysettings;
  settings.set('theme', settings.theme === 'dark' ? 'light' : 'dark');
  adjustTheme();
}
