'use strict';
/* Scratch教室専用。基本情報と全10回のスケジュールは index.html に直接記述。 */
const SCRATCH_SETTINGS = {
  registrationStatus: 'before', // 'before' | 'open' | 'closed'
  eventStatus: 'upcoming',       // 'upcoming' | 'ended'
  registrationFormUrl: '',       // 受付開始前は空欄
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
