const fs = require('fs');
const { execSync } = require('child_process');

function setMain(mainValue) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.main = mainValue;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
}

try {
  console.log("Setting package.json main to Expo router for web export...");
  setMain('expo-router/entry');
  execSync('npx expo export -p web', { stdio: 'inherit' });
  
  console.log("Setting package.json main to main.js for electron-builder...");
  setMain('main.js');
  execSync('npx electron-builder --win', { stdio: 'inherit' });
} catch (error) {
  console.error("Build failed:", error.message);
} finally {
  console.log("Restoring package.json main to Expo router...");
  setMain('expo-router/entry');
}
