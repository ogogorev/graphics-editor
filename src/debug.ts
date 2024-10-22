let logQueue: any[] = [];
let clearIntervalId: any = null;

const writeLogs = () => {

  clearIntervalId = setInterval(() => {
    const debugP = document.querySelector('#debug-container');

    if (debugP) {
      const newText = logQueue.map(l => l.map((a: any) => JSON.stringify(a, null, 2)).join('\n')).join('\n\n') + debugP.innerHTML;

      debugP.innerHTML = newText;
      logQueue = [];
    } else {
      console.log('debug container not found');
    }

  }, 100);

}

export const log = (...args: any) => {
  logQueue.push(args);

  if (!clearIntervalId) {
    writeLogs();
  }
}
