const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBgKOir8nkDRRt5JJcDcfaJIBHBLGjb5qI",
  authDomain: "musf-summit-reg.firebaseapp.com",
  projectId: "musf-summit-reg",
  storageBucket: "musf-summit-reg.firebasestorage.app",
  messagingSenderId: "14502064606",
  appId: "1:14502064606:web:e4da5c514fe579d6bdad4f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const testDoc = doc(db, 'teams', 'team_a');
  await setDoc(testDoc, { id: 'team_a', name: 'Team A', color: '#0E7C86' });
  const snap = await getDoc(testDoc);
  console.log('Test doc written and read back:', snap.data());
  process.exit(0);
}

run().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
