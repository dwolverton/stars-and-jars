# Stars and Jars

Three configuration files are not included in the repository.
1. .env.local - holds the accountId to use in development
   ```properties
   VITE_ACCOUNT_ID=ABCDEF1234567890
   ```
2. .env.production.local - holds the accountId to use in production (npm run build)
   ```properties
   VITE_ACCOUNT_ID=ABCDEF1234567890
   ```
3. src/firebase/firebaseconfig.ts - exports the firebase config object.
   ```ts
   const firebaseConfig = {
      apiKey: "...",
      authDomain: "...",
      projectId: "...",
      storageBucket: "...,
      messagingSenderId: "...",
      appId: "..."
   };

   export default firebaseConfig;
   ```