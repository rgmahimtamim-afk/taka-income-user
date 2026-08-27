import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCWOxxWDINgbglxErNkZ7lb4pMD9xAsbcw',
  authDomain: 'taka-income-deee0.firebaseapp.com',
  databaseURL: 'https://taka-income-deee0-default-rtdb.firebaseio.com',
  projectId: 'taka-income-deee0',
  storageBucket: 'taka-income-deee0.firebasestorage.app',
  messagingSenderId: '604187858657',
  appId: '1:604187858657:web:a680108e839fca794b89a0'
};

initializeApp(firebaseConfig);
getDatabase();

const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

autoFillTelegramUser();
setupNavigation();
setupActions();

function autoFillTelegramUser(){
  const user = tg?.initDataUnsafe?.user;
  if (!user) {
    document.getElementById('hello').textContent = 'Open this page from your Telegram Mini App';
    return;
  }
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  document.getElementById('hello').textContent = name || 'Telegram user';
  document.getElementById('avatar').textContent = (user.first_name || 'T').charAt(0).toUpperCase();
  document.getElementById('tgId').textContent = String(user.id);
  document.getElementById('tgName').textContent = name || '—';
  document.getElementById('tgUsername').textContent = user.username ? '@' + user.username : '—';

  const ref = tg.initDataUnsafe?.start_param;
  if(ref){
    document.getElementById('refLink').textContent = `Referral received: ${ref}`;
  }
}

function setupNavigation(){
  document.querySelectorAll('.nav').forEach(btn => btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    document.querySelectorAll('.nav').forEach(n => n.classList.remove('active'));
    btn.classList.add('active');
    tg?.HapticFeedback?.selectionChanged();
  }));
}

function setupActions(){
  document.getElementById('copyRef').addEventListener('click', async () => {
    const user = tg?.initDataUnsafe?.user;
    if(!user) return toast('Open the app from Telegram first.');
    const link = `https://t.me/taka67incomebd_bot?start=ref_${user.id}`;
    try { await navigator.clipboard.writeText(link); toast('Referral link copied.'); }
    catch { toast(link); }
  });

  document.getElementById('watchAdBtn').addEventListener('click', watchAd);
  document.getElementById('withdrawBtn').addEventListener('click', requestWithdrawal);
}

async function watchAd(){
  const user = tg?.initDataUnsafe?.user;
  if(!user) return toast('Open the Mini App from Telegram.');

  // Replace this after creating the AdsGram Telegram Mini App ad block.
  const ADS_BLOCK_ID = 'YOUR_ADSGRAM_BLOCK_ID';
  if(ADS_BLOCK_ID === 'YOUR_ADSGRAM_BLOCK_ID'){
    return toast('AdsGram Block ID এখনো বসানো হয়নি।');
  }

  try{
    const AdController = window.Adsgram?.init({ blockId: ADS_BLOCK_ID });
    if(!AdController) throw new Error('AdsGram SDK not available');
    const result = await AdController.show();

    // IMPORTANT: never credit balance from this client result alone.
    // Send a verified server event here after the backend is implemented.
    console.log('AdsGram result:', result);
    toast('Ad completed. Server verification is required before reward.');
  }catch(error){
    console.error(error);
    toast('Ad could not be shown. Please try again.');
  }
}

async function requestWithdrawal(){
  const amount = Number(document.getElementById('withdrawAmount').value);
  const method = document.getElementById('withdrawMethod').value;
  const account = document.getElementById('withdrawAccount').value.trim();
  if(!amount || amount <= 0) return toast('Enter a valid amount.');
  if(!method) return toast('Select a withdrawal method.');
  if(!account) return toast('Enter your account/number.');

  // This button will call the secure backend after it is deployed.
  // Do not write withdrawal requests directly from the browser.
  toast('Withdrawal backend is not connected yet.');
}

function toast(message){
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}
