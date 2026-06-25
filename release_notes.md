# MAID Windows Desktop Port

This is a custom Windows Desktop port of the Mobile Artificial Intelligence Distribution (MAID) application.

## How the Windows Architecture Works

The original MAID application is built on React Native and heavily relies on the `llama.rn` package for local iOS and Android inference. To bring this application to Windows efficiently, this port completely bypasses the mobile native modules and utilizes a custom Electron wrapper architecture:

1. **Static Web Bundle**: The React Native frontend UI is exported into a static web bundle using the Expo Metro bundler.
2. **Mocking the Mobile Native Engine**: During the Metro bundling phase, the `llama.rn` native mobile bindings are intercepted and mocked out to prevent Server-Side Rendering (SSR) and web compilation crashes.
3. **Electron IPC Bridge**: The frontend is rewired to communicate with an Electron Main Process via an Inter-Process Communication (IPC) bridge. 
4. **Desktop Inference Engine**: The Electron Main Process acts as the new "brain", utilizing `node-llama-cpp` to load `.gguf` models directly into your Windows hardware's memory and process prompts natively. 

The result is a completely self-contained `.exe` installer that runs the beautiful React Native UI flawlessly on desktop, while utilizing a Node-native C++ backend for fast, local LLM execution.
