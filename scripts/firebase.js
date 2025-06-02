// scripts/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyAvw9i4bV-Zq0PVEGumiAvZ1HIuNe7MVTE",
  authDomain: "site-de-velas.firebaseapp.com",
  projectId: "site-de-velas",
  storageBucket: "site-de-velas.firebasestorage.app",
  messagingSenderId: "629570686928",
  appId: "1:629570686928:web:201bee3ec50397298e73d5",
  measurementId: "G-BBSTRLNK0M"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
export { db };
