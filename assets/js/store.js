/* 8パス — shared data & reservation store (localStorage-backed demo) */
window.OCTO = (function () {
  const KEY = 'octo_reservations_v1';

  const MENUS = [
    { id: 'm1', name: 'パーソナルストレッチ', min: 60, price: 11000, desc: '全身をていねいにほぐす基本の施術' },
    { id: 'm2', name: 'デスクワーク集中ケア', min: 60, price: 12000, desc: '肩・首・肩甲骨まわりを重点的に' },
    { id: 'm3', name: 'フルメンテナンス', min: 90, price: 13000, desc: '全身＋気になる部位をじっくり' },
    { id: 'm4', name: 'はじめてのカウンセリング体験', min: 50, price: 10000, desc: '体の状態を確認しながらお試し（初回限定）' },
  ];

  const STAFF = [
    { id: 's0', name: '指名なし', initial: '∞', role: '空いているトレーナー' },
    { id: 's1', name: 'タカ', initial: 'T', role: '代表トレーナー' },
    { id: 's2', name: 'ミナ', initial: 'M', role: 'トレーナー' },
  ];

  // business hours: 10:00–20:00 last reception, slots every 90min-ish
  const SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

  function seedIfEmpty() {
    let list = load();
    if (list.length) return list;
    const d = new Date();
    d.setDate(d.getDate() + 5);
    const iso = d.toISOString().slice(0, 10);
    list = [
      {
        code: 'OCT-2048',
        menuId: 'm2', staffId: 's1',
        date: iso, time: '13:00',
        name: '森本 敦', tel: '090-0000-0000', email: 'guest@example.com', note: '',
        createdAt: Date.now(),
      },
    ];
    save(list);
    return list;
  }

  function add(r) {
    const list = load();
    r.code = 'OCT-' + Math.floor(1000 + Math.random() * 9000);
    r.createdAt = Date.now();
    list.push(r);
    save(list);
    return r;
  }
  function update(code, patch) {
    const list = load();
    const i = list.findIndex((r) => r.code === code);
    if (i > -1) { list[i] = Object.assign({}, list[i], patch); save(list); return list[i]; }
    return null;
  }
  function remove(code) { save(load().filter((r) => r.code !== code)); }

  // which slots are taken for a given date (+ optional staff)
  function takenSlots(date, staffId, exceptCode) {
    return load()
      .filter((r) => r.date === date && r.code !== exceptCode && (staffId === 's0' || !staffId || r.staffId === staffId || r.staffId === 's0'))
      .map((r) => r.time);
  }

  const menu = (id) => MENUS.find((m) => m.id === id);
  const staff = (id) => STAFF.find((s) => s.id === id);
  const yen = (n) => '¥' + n.toLocaleString('ja-JP');

  const WD = ['日', '月', '火', '水', '木', '金', '土'];
  function fmtDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return `${d.getMonth() + 1}月${d.getDate()}日(${WD[d.getDay()]})`;
  }

  return { MENUS, STAFF, SLOTS, WD, load, save, seedIfEmpty, add, update, remove, takenSlots, menu, staff, yen, fmtDate };
})();
