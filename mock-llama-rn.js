let ipcRenderer = null;
if (typeof window !== 'undefined' && window.require) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

export const initLlama = async (config) => {
  await ipcRenderer.invoke('llama-init', { model: config.model });

  return {
    completion: async (options, onToken) => {
      // Extract the latest user message from the OpenAI compatible array
      const lastMsg = options.messages[options.messages.length - 1];
      let promptText = "";
      if (typeof lastMsg.content === 'string') {
        promptText = lastMsg.content;
      } else if (Array.isArray(lastMsg.content)) {
        promptText = lastMsg.content.find(c => c.type === 'text')?.text || "";
      }

      const tokenListener = (event, tokenText) => {
        onToken({ token: tokenText });
      };
      
      ipcRenderer.on('llama-token', tokenListener);
      
      const res = await ipcRenderer.invoke('llama-prompt', { promptText });
      
      ipcRenderer.removeListener('llama-token', tokenListener);
      
      if (!res.success) throw new Error(res.error);
      return { timings: {} };
    },
    release: async () => {
      await ipcRenderer.invoke('llama-release');
    }
  };
};

export const loadLlamaModelInfo = async () => ({
  "context_length": 4096
});
