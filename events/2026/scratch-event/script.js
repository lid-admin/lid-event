'use strict';
/* Scratch教室専用。基本情報と全10回のスケジュールは index.html に直接記述。 */
const SCRATCH_SETTINGS = {
  registrationStatus: 'open', // 'before' | 'open' | 'closed'
  eventStatus: 'upcoming',       // 'upcoming' | 'ended'
  registrationFormUrl: 'https://forms.gle/tnLynBL6xeMMXcCm8', // Googleフォーム（仮版）
  venueName: '',                 // 会場決定後に設定
  venueAddress: '',
  venueMapsUrl: '',
  registrationDeadline: '未定'
};
const el = id => document.getElementById(id);
function applySettings() {
  const s = SCRATCH_SETTINGS;
  const ended = s.eventStatus === 'ended';
  const statuses = {
    before: { label:'受付開始前', css:'status-before', message:'お申し込みの受付開始まで、もう少しお待ちください。' },
    open: { label:'受付中', css:'status-open', message:'お申し込みは下記のフォームからお願いします。' },
    closed: { label:'受付終了', css:'status-closed', message:'この教室の申込受付は終了しました。' }
  };
  const current = ended
    ? {label:'開催終了', css:'status-ended', message:'この教室は開催終了しました。'}
    : (statuses[s.registrationStatus] || statuses.before);
  const badge = el('registration-badge');
  badge.textContent = current.label;
  badge.className = 'status-badge ' + current.css;
  el('registration-message').textContent = current.message;
  const control = el('registration-control');
  control.replaceChildren();
  el('external-note').hidden = true;
  if (ended || s.registrationStatus === 'closed') {
    const label = document.createElement('span');
    label.className = 'disabled-cta';
    label.textContent = ended ? '開催終了' : '申込受付は終了しました';
    control.append(label);
  } else if (s.registrationStatus === 'open' && s.registrationFormUrl) {
    const link = document.createElement('a');
    link.className = 'cta';
    link.textContent = 'お申し込みフォームへ';
    link.href = s.registrationFormUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    control.append(link);
    el('external-note').hidden = false;
  } else {
    const label = document.createElement('span');
    label.className = 'disabled-cta';
    label.textContent = '申込フォーム準備中';
    control.append(label);
  }
  el('info-deadline').textContent = s.registrationDeadline || '未定';
  const venue = el('info-venue');
  venue.replaceChildren();
  if (!s.venueName) {
    venue.textContent = '調整中';
  } else {
    venue.append(document.createTextNode(s.venueName));
    if (s.venueAddress) {
      venue.append(document.createElement('br'), document.createTextNode(s.venueAddress));
    }
    if (s.venueMapsUrl) {
      const link = document.createElement('a');
      link.href = s.venueMapsUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Google マップで見る ↗';
      venue.append(document.createElement('br'), link);
    }
  }
}
document.addEventListener('DOMContentLoaded', applySettings);


// 教室紹介の画像を5秒ごとに切り替える。操作中・非表示時は自動再生を停止。
function initClassroomSlideshow() {
  const root = document.querySelector('.classroom-slideshow');
  if (!root) return;
  const slides = [...root.querySelectorAll('.classroom-slide')];
  const dots = [...root.querySelectorAll('.classroom-slide-dot')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let intervalId = null;
  let isVisible = true;
  let isPaused = false;
  const show = index => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };
  const stop = () => { if (intervalId !== null) clearInterval(intervalId); intervalId = null; };
  const start = () => {
    stop();
    if (!reducedMotion.matches && isVisible && !isPaused && !document.hidden) {
      intervalId = window.setInterval(() => show(current + 1), 5000);
    }
  };
  root.querySelector('#classroom-slide-prev').addEventListener('click', () => { show(current - 1); start(); });
  root.querySelector('#classroom-slide-next').addEventListener('click', () => { show(current + 1); start(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
  root.addEventListener('mouseenter', () => { isPaused = true; stop(); });
  root.addEventListener('mouseleave', () => { isPaused = false; start(); });
  root.addEventListener('focusin', () => { isPaused = true; stop(); });
  root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) { isPaused = false; start(); } });
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener('change', start);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { isVisible = entries[0].isIntersecting; start(); }, { threshold: .1 }).observe(root);
  }
  show(0);
  start();
}
document.addEventListener('DOMContentLoaded', initClassroomSlideshow);
