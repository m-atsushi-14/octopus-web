/* 8パス — my page: list / reschedule / cancel (manage.html) */
(function () {
  const O = window.OCTO;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const toast = (msg) => {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2600);
  };

  O.seedIfEmpty();
  const m = { code: null, date: null, time: null, calRef: new Date() };

  function isPast(r) {
    const d = new Date(r.date + 'T' + (r.time || '00:00'));
    return d < new Date();
  }

  function render() {
    const list = O.load().slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (!list.length) {
      $('#resList').innerHTML = `
        <div class="empty">
          <div class="big8">∞</div>
          <p>現在ご予約はありません。</p>
          <a href="reserve.html" class="btn" style="margin-top:18px">Webで予約する →</a>
        </div>`;
      return;
    }
    $('#resList').innerHTML = list.map((r) => {
      const menu = O.menu(r.menuId), staff = O.staff(r.staffId);
      const d = new Date(r.date + 'T00:00:00');
      const past = isPast(r);
      return `
        <article class="res-card ${past ? 'past' : ''}">
          <div class="res-date">
            <div class="d">${d.getDate()}</div>
            <div class="my">${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}</div>
            <div class="w">${O.WD[d.getDay()]}曜 ${r.time}</div>
          </div>
          <div class="res-info">
            <h3>${menu.name} <span style="font-weight:400;color:var(--ink-soft);font-size:.85rem">${menu.min}分</span></h3>
            <div class="meta">
              <span>👤 ${staff.name}</span>
              <span>💴 ${O.yen(menu.price)}</span>
              <span>🎫 ${r.code}</span>
            </div>
            ${r.note ? `<div class="meta"><span>📝 ${r.note}</span></div>` : ''}
          </div>
          <div class="res-actions">
            ${past
              ? '<span class="badge-status">来店済み</span>'
              : `<button class="btn ghost" style="color:var(--ink)" data-resched="${r.code}">日時変更</button>
                 <button class="btn text" data-cancel="${r.code}">キャンセル</button>`}
          </div>
        </article>`;
    }).join('');

    $$('[data-resched]').forEach((b) => b.addEventListener('click', () => openModal(b.dataset.resched)));
    $$('[data-cancel]').forEach((b) => b.addEventListener('click', () => doCancel(b.dataset.cancel)));
  }

  function doCancel(code) {
    const r = O.load().find((x) => x.code === code);
    if (!r) return;
    if (!confirm(`${O.fmtDate(r.date)} ${r.time} のご予約をキャンセルしますか？`)) return;
    O.remove(code);
    toast('予約をキャンセルしました');
    render();
  }

  /* ---------- reschedule modal ---------- */
  function openModal(code) {
    const r = O.load().find((x) => x.code === code);
    if (!r) return;
    m.code = code; m.date = null; m.time = null; m.calRef = new Date(r.date + 'T00:00:00');
    const menu = O.menu(r.menuId);
    $('#mSub').textContent = `${menu.name}（${menu.min}分）／ 現在：${O.fmtDate(r.date)} ${r.time}〜`;
    $('#mSlotTitle').textContent = '日付を選んでください';
    $('#mSlots').innerHTML = '';
    $('#mSave').disabled = true;
    renderCal();
    $('#modalBack').classList.add('open');
  }
  function closeModal() { $('#modalBack').classList.remove('open'); }

  function renderCal() {
    const r = O.load().find((x) => x.code === m.code);
    const ref = m.calRef, y = ref.getFullYear(), mo = ref.getMonth();
    $('#mMonth').textContent = `${y}年 ${mo + 1}月`;
    const first = new Date(y, mo, 1).getDay();
    const days = new Date(y, mo + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let html = '';
    for (let i = 0; i < first; i++) html += '<button disabled></button>';
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, mo, d);
      const iso = `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const disabled = date < today;
      const free = !disabled && O.takenSlots(iso, r.staffId, m.code).length < O.SLOTS.length;
      const sel = m.date === iso ? ' sel' : '';
      const has = !disabled && free ? ' has' : '';
      html += `<button class="${sel}${has}" data-iso="${iso}" ${disabled ? 'disabled' : ''}>${d}</button>`;
    }
    $('#mGrid').innerHTML = html;
  }

  function renderSlots() {
    const r = O.load().find((x) => x.code === m.code);
    if (!m.date) { $('#mSlots').innerHTML = ''; return; }
    $('#mSlotTitle').textContent = O.fmtDate(m.date) + ' の空き時間';
    const taken = O.takenSlots(m.date, r.staffId, m.code);
    $('#mSlots').innerHTML = O.SLOTS.map((t) => {
      const isTaken = taken.includes(t);
      const sel = m.time === t ? ' sel' : '';
      return `<button class="${sel}" data-t="${t}" ${isTaken ? 'disabled' : ''}>${t}</button>`;
    }).join('');
  }

  $('#mPrev').addEventListener('click', () => { m.calRef.setMonth(m.calRef.getMonth() - 1); renderCal(); });
  $('#mNext').addEventListener('click', () => { m.calRef.setMonth(m.calRef.getMonth() + 1); renderCal(); });
  $('#mGrid').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-iso]'); if (!b || b.disabled) return;
    m.date = b.dataset.iso; m.time = null; renderCal(); renderSlots(); $('#mSave').disabled = true;
  });
  $('#mSlots').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-t]'); if (!b || b.disabled) return;
    m.time = b.dataset.t;
    $$('#mSlots button').forEach((s) => s.classList.toggle('sel', s === b));
    $('#mSave').disabled = false;
  });
  $('#mSave').addEventListener('click', () => {
    if (!m.date || !m.time) return;
    O.update(m.code, { date: m.date, time: m.time });
    closeModal(); toast('予約日時を変更しました ∞'); render();
  });
  $('#mCancel').addEventListener('click', closeModal);
  $('#modalBack').addEventListener('click', (e) => { if (e.target.id === 'modalBack') closeModal(); });

  render();
})();
