export namespace Link {

  export function NewTab(url: string) {
    if (window.electron) {
      window.electron.ipcRenderer.sendMessage('open-link', [url]);
    } else {
      window.open(url);
    }
  }
}
