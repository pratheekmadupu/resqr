
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import fs from 'fs';

const firebaseConfig = {
  databaseURL: "https://resqr-c0683-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function check() {
  const username = 'pratheek';
  console.log(`Checking username: ${username}`);
  
  const regSnap = await get(ref(db, `usernames/${username}`));
  if (!regSnap.exists()) {
    console.log("Username not found in registry");
    process.exit(0);
  }
  
  const path = regSnap.val();
  console.log(`Path mapping: ${path}`);
  
  const profileSnap = await get(ref(db, `users/${path}`));
  if (!profileSnap.exists()) {
     console.log("Main profile node NOT FOUND at users/" + path);
     // Try direct profiles
     const pid = path.split('/').pop();
     const legacySnap = await get(ref(db, `profiles/${pid}`));
     if (legacySnap.exists()) {
        console.log("Legacy profile node FOUND at profiles/" + pid);
        console.log(JSON.stringify(legacySnap.val(), null, 2));
     }
  } else {
    console.log("Main profile node FOUND");
    console.log(JSON.stringify(profileSnap.val(), null, 2));
  }
  
  process.exit(0);
}

check();
