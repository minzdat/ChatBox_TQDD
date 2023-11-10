import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCNBTn4LI-qxnFn1sKvCica7uDGJdI-amM",
  authDomain: "lab3-832cc.firebaseapp.com",
  databaseURL: "https://lab3-832cc-default-rtdb.firebaseio.com",
  projectId: "lab3-832cc",
  storageBucket: "lab3-832cc.appspot.com",
  messagingSenderId: "62837257469",
  appId: "1:62837257469:web:94bc8cc8b4be4e5f78ba94",
  measurementId: "G-T8DZRSRXDZ"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, get, set }; 
