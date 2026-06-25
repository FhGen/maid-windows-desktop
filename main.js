const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getLlama, LlamaChatSession } = require('node-llama-cpp');

let llamaInstance = null;
let currentModel = null;
let currentContext = null;
let currentSession = null;

async function initLlamaEngine(modelPath) {
  if (!llamaInstance) {
    llamaInstance = await getLlama();
  }
  if (currentModel) {
    currentModel = null;
  }
  currentModel = await llamaInstance.loadModel({ modelPath });
  currentContext = await currentModel.createContext();
  currentSession = new LlamaChatSession({ contextSequence: currentContext.getSequence() });
  return true;
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(() => {
  ipcMain.handle('llama-init', async (event, { model }) => {
    try {
      await initLlamaEngine(model);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('llama-prompt', async (event, { promptText }) => {
    try {
      if (!currentSession) throw new Error("Session not initialized");
      const res = await currentSession.prompt(promptText, {
        onToken(chunk) {
          event.sender.send('llama-token', currentModel.tokensToString(chunk));
        }
      });
      return { success: true, text: res };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('llama-release', async () => {
    currentSession = null;
    currentContext = null;
    currentModel = null;
    return true;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
