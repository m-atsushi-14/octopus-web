/* 8パス — reservation flow (reserve.html) */
(function () {
  const O = window.OCTO;
  const state = { step: 1, menuId: null, staffId: null, date: null, time: null, calRef: new Date() };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const toast = (msg) => {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2600);
  };

  /* ---- step navigation ---- */
  function goto(step) {
    state.step = step;
    $$('.panel').forEach((p) => p.classList.toggle('active', +p.dataset.panel === step));
    $$('#stepsBar .s').forEach((s) => {
      const n = +s.dataset.step;
      s.classList.toggle('active', n === step);
      s.classList.toggle('done', n < step);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- step 1: menu ---- */
  function renderMenus() {
    $('#menuGrid').innerHTML = O.MENUS.map((m) => `
      <button class="opt" data-id="${m.id}">
        <h3>${m.name}</h3>
        <div class="meta">${m.min}分 ・ ${m.desc}</div>
        <div class="amt">${O.yen(m.price)} <small>／ ${m.min}分</small></div>
      </button>`).join('');
    $('#menuGrid').addEventListener('click', (e) => {
      const b = e.target.closest('.opt'); if (!b) return;
      state.menuId = b.dataset.id;
      $$('#menuGrid .opt').forEach((o) => o.classList.toggle('sel', o === b));
      $('#next1').disabled = false;
    });
  }

  /* ---- step 2: staff ---- */
  function renderStaff() {
    $('#staffGrid').innerHTML = O.STAFF.map((s) => `
      <button class="opt person" data-id="${s.id}">
        <span class="av">${s.initial}</span>
        <span><h3>${s.name}</h3><div class="meta">${s.role}</div></span>
      </button>`).join('');
    $('#staffGrid').addEventListener('click', (e) => {
      const b = e.target.closest('.opt'); if (!b) return;
      state.staffId = b.dataset.id;
      $$('#staffGrid .opt').forEach((o) => o.classList.toggle('sel', o === b));
      $('#next2').disabled = false;
    });
  }

  /* ---- step 3: calendar + slots ---- */
  function renderCal() {
    const ref = state.calRef;
    const y = ref.getFullYear(), m = ref.getMonth();
    $('#calMonth').textContent = `${y}年 ${m + 1}月`;
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    let html = '';
    for (let i = 0; i < first; i++) html += '<button disabled></button>';
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d);
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = date < today;
      const dow = date.getDay();
      const closed = false; // 不定休 — demo: all days bookable
      const disabled = isPast || closed;
      const free = !disabled && O.takenSlots(iso, state.staffId).length < O.SLOTS.length;
      const sel = state.date === iso ? ' sel' : '';
      const has = !disabled && free ? ' has' : '';
      html += `<button class="${sel}${has}" data-iso="${iso}" ${disabled ? 'disabled' : ''}>${d}</button>`;
    }
    $('#calGrid').innerHTML = html;
  }

  function renderSlots() {
    const box = $('#slots');
    if (!state.date) { box.innerHTML = ''; return; }
    $('#slotTitle').textContent = O.fmtDate(state.date) + ' の空き時間';
    const taken = O.takenSlots(state.date, state.staffId);
    box.innerHTML = O.SLOTS.map((t) => {
      const isTaken = taken.includes(t);
      const sel = state.time === t ? ' sel' : '';
      return `<button class="${sel}" data-t="${t}" ${isTaken ? 'disabled' : ''}>${t}</button>`;
    }).join('');
  }

  function bindCal() {
    $('#prevM').addEventListener('click', () => { state.calRef.setMonth(state.calRef.getMonth() - 1); renderCal(); });
    $('#nextM').addEventListener('click', () => { state.calRef.setMonth(state.calRef.getMonth() + 1); renderCal(); });
    $('#calGrid').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-iso]'); if (!b || b.disabled) return;
      state.date = b.dataset.iso; state.time = null;
      renderCal(); renderSlots();
      $('#next3').disabled = true;
    });
    $('#slots').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-t]'); if (!b || b.disabled) return;
      state.time = b.dataset.t;
      $$('#slots button').forEach((s) => s.classList.toggle('sel', s === b));
      $('#next3').disabled = false;
    });
  }

  /* ---- step 4: summary ---- */
  function renderSummary() {
    const m = O.menu(state.menuId), s = O.staff(state.staffId);
    $('#sumList').innerHTML = `
      <dt>メニュー</dt><dd>${m.name}（${m.min}分）</dd>
      <dt>担当</dt><dd>${s.name}</dd>
      <dt>日付</dt><dd>${O.fmtDate(state.date)}</dd>
      <dt>時間</dt><dd>${state.time}〜</dd>`;
    $('#sumTotal').textContent = O.yen(m.price);
  }

  /* ---- confirm ---- */
  function confirm() {
    const form = $('#custForm');
    if (!form.name.value.trim() || !form.tel.value.trim()) {
      toast('お名前と電話番号をご入力ください');
      goto(4); form.reportValidity(); return;
    }
    const rec = O.add({
      menuId: state.menuId, staffId: state.staffId, date: state.date, time: state.time,
      name: form.name.value.trim(), tel: form.tel.value.trim(), email: form.email.value.trim(),
      referrer: form.referrer.value.trim(), note: form.note.value.trim(),
    });
    const m = O.menu(rec.menuId), s = O.staff(rec.staffId);
    $('#doneCode').textContent = rec.code;
    $('#doneRecap').innerHTML = `
      <dt>予約番号</dt><dd>${rec.code}</dd>
      <dt>メニュー</dt><dd>${m.name}</dd>
      <dt>担当</dt><dd>${s.name}</dd>
      <dt>日時</dt><dd>${O.fmtDate(rec.date)} ${rec.time}〜</dd>
      <dt>お名前</dt><dd>${rec.name} 様</dd>`;
    goto(5);
  }

  /* ---- wire up ---- */
  renderMenus();
  renderStaff();
  bindCal();
  $('#next1').addEventListener('click', () => goto(2));
  $('#next2').addEventListener('click', () => { renderCal(); renderSlots(); goto(3); });
  $('#next3').addEventListener('click', () => { renderSummary(); goto(4); });
  $('#confirmBtn').addEventListener('click', confirm);
  $$('[data-back]').forEach((b) => b.addEventListener('click', () => goto(+b.dataset.back)));
  goto(1);
})();
