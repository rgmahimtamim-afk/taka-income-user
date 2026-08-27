import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

// =========================
// FIREBASE CONFIG
// =========================
const firebaseConfig = {
  apiKey: 'AIzaSyCWOxxWDINgbglxErNkZ7lb4pMD9xAsbcw',
  authDomain: 'taka-income-deee0.firebaseapp.com',
  databaseURL: 'https://taka-income-deee0-default-rtdb.firebaseio.com',
  projectId: 'taka-income-deee0',
  storageBucket: 'taka-income-deee0.firebasestorage.app',
  messagingSenderId: '604187858657',
  appId: '1:604187858657:web:a680108e839fca794b89a0'
};

// Do not put your Telegram Bot Token in this file.
// Backend URL will be added after the secure backend is deployed.
const API_BASE_URL = '';

// Add your AdsGram rewarded Block ID here after AdsGram gives it to you.
const ADSGRAM_BLOCK_ID = '';

const app = initializeApp(firebaseConfig);
getDatabase(app);

const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const user = tg?.initDataUnsafe?.user || null;

const state = {
  balance: 0,
  adsWatched: 0,
  tasksDone: 0,
  refCount: 0,
  refEarn: 0,
  minWithdraw: 150,
  methods: [],
  notice: 'Welcome to Taka Income.'
};

const $ = id => document.getElementById(id);
const money = n => Number(n || 0).toFixed(2);

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}

function render() {
  const first = user?.first_name || 'User';
  $('hello').textContent = user ? `Hi, ${first}` : 'Open this page from Telegram';
  $('avatar').textContent = (first[0] || 'T').toUpperCase();
  $('tgId').textContent = user?.id ?? '—';
  $('tgName').textContent = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || '—';
  $('tgUsername').textContent = user?.username ? '@' + user.username : '—';
  $('balance').textContent = money(state.balance);
  $('profileBalance').textContent = money(state.balance);
  $('adsWatched').textContent = state.adsWatched;
  $('profileAds').textContent = state.adsWatched;
  $('tasksDone').textContent = state.tasksDone;
  $('refCount').textContent = state.refCount;
  $('refEarn').textContent = money(state.refEarn);
  $('minWithdraw').textContent = money(state.minWithdraw);
  $('noticeText').textContent = state.notice;

  const botUsername = 'taka67incomebd_bot';
  $('refLink').textContent = user ? `https://t.me/${botUsername}?start=ref_${user.id}` : 'Open inside Telegram';

  const select = $('withdrawMethod');
  if (state.methods.length) {
    select.innerHTML = '<option value="">Select method</option>' + state.methods.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
  }
}

async function loadFromBackend() {
  if (!API_BASE_URL || !user?.id) return;
  try {
    const response = await fetch(`${API_BASE_URL}/api/me`, {
      headers: { Authorization: `tma ${tg.initData}` }
    });
    if (!response.ok) throw new Error('Profile request failed');
    Object.assign(state, await response.json());
    render();
  } catch (error) {
    console.error(error);
    toast('Account data could not be loaded.');
  }
}

async function watchAd() {
  if (!user) return toast('Open the Mini App from Telegram first.');
  if (!ADSGRAM_BLOCK_ID) return toast('AdsGram Block ID is not added yet.');
  if (!API_BASE_URL) return toast('Secure reward server is not connected yet.');

  try {
    const controller = window.Adsgram?.init?.({ blockId: ADSGRAM_BLOCK_ID });
    if (!controller) throw new Error('AdsGram SDK unavailable');
    await controller.show();

    // Never add balance in this browser. The backend must verify the reward event.
    toast('Ad completed. Waiting for server verification…');
    await loadFromBackend();
  } catch (error) {
    console.error(error);
    toast('Ad was not completed.');
  }
}

async function requestWithdrawal() {
  const amount = Number($('withdrawAmount').value);
  const method = $('withdrawMethod').value;
  const account = $('withdrawAccount').value.trim();
  if (!amount || amount < state.minWithdraw) return toast(`Minimum withdrawal is ৳${money(state.minWithdraw)}`);
  if (!method || !account) return toast('Fill all withdrawal fields.');
  if (!API_BASE_URL) return toast('Secure withdrawal backend is not connected yet.');

  try {
    const response = await fetch(`${API_BASE_URL}/api/withdrawals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `tma ${tg.initData}`
      },
      body: JSON.stringify({ amount, method, account })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Withdrawal failed');
    toast('Withdrawal request submitted.');
    $('withdrawAmount').value = '';
    $('withdrawAccount').value = '';
    await loadFromBackend();
  } catch (error) {
    console.error(error);
    toast(error.message);
  }
}

$('watchAdBtn').addEventListener('click', watchAd);
$('withdrawBtn').addEventListener('click', requestWithdrawal);
$('copyRef').addEventListener('click', async () => {
  const link = $('refLink').textContent;
  try {
    await navigator.clipboard.writeText(link);
    toast('Referral link copied.');
  } catch {
    toast(link);
  }
});

document.querySelectorAll('.nav').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.nav').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  $(btn.dataset.page).classList.add('active');
  tg?.HapticFeedback?.selectionChanged();
}));

render();
loadFromBackend();
