import { ipcMain } from 'electron';
import IPC from '../ReactIPC';

// why do i exist? well because i dont want links to be a tags which changes the page electron is on, not ideal...
export function Anchor({ href, text }: { href: string; text: string }) {
  function openLink() {
    IPC.sendMessage('open-link', href);
  }

  return (
    <a
      href="#"
      onClick={() => {
        window.open(href, '_blank');
      }}
    >
      {text}
    </a>
  );
}
