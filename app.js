/* =========================================================
   Meus Ganhos — lógica do aplicativo
   Tudo fica salvo no aparelho (localStorage). Sem servidor, sem login.
   ========================================================= */
(() => {
  'use strict';

  /* ---------- utilidades ---------- */

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto',
    'setembro', 'outubro', 'novembro', 'dezembro'];
  const MES3 = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira',
    'sexta-feira', 'sábado'];
  const DIA3 = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  /* Datas sempre no horário LOCAL (nunca toISOString, que usa UTC e
     viraria o dia à noite no Brasil). */
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const hoje = () => ymd(new Date());
  const somaDias = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
  const mesDe = s => s.slice(0, 7);
  const mesAtual = () => mesDe(hoje());
  const diasNoMes = k => { const [y, m] = k.split('-').map(Number); return new Date(y, m, 0).getDate(); };
  const somaMeses = (k, n) => {
    const [y, m] = k.split('-').map(Number);
    const d = new Date(y, m - 1 + n, 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  };
  const difMeses = (a, b) => {
    const [y1, m1] = a.split('-').map(Number), [y2, m2] = b.split('-').map(Number);
    return (y2 - y1) * 12 + (m2 - m1);
  };
  const nomeMes = k => MESES[Number(k.slice(5, 7)) - 1];
  const maiuscula = s => s.charAt(0).toUpperCase() + s.slice(1);
  const rotuloMes = k => `${nomeMes(k)} de ${k.slice(0, 4)}`;
  const mes3 = k => MES3[Number(k.slice(5, 7)) - 1];
  const rotuloDia = s => { const d = parse(s); return `${DIA3[d.getDay()]}, ${d.getDate()} ${MES3[d.getMonth()]}`; };
  const diaLongo = s => { const d = parse(s); return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`; };

  const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  const nfc = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
  const dinheiro = c => 'R$ ' + nf2.format(c / 100);
  const dinheiroInt = c => 'R$ ' + nf0.format(Math.round(c / 100));
  const horas = min => {
    if (!min) return '0h';
    const h = Math.floor(min / 60), m = min % 60;
    return h ? (m ? `${h}h${pad(m)}` : `${h}h`) : `${m}min`;
  };
  const clampInt = (v, min, max) => {
    v = Math.round(Number(v));
    return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min;
  };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

  /* ---------- ícones ---------- */

  const svg = p => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICON = {
    registrar: svg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>'),
    mes: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
    contas: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>'),
    check: svg('<polyline points="20 6 9 17 4 12"/>'),
    evolucao: svg('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'),
    historico: svg('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'),
    ajustes: svg('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>'),
    edit: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'),
    trash: svg('<path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>'),
    left: svg('<polyline points="15 18 9 12 15 6"/>'),
    right: svg('<polyline points="9 18 15 12 9 6"/>'),
    up: svg('<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>'),
    down: svg('<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>'),
  };
  const TABS = { registrar: 'Registrar', mes: 'Mês', contas: 'Contas', evolucao: 'Evolução', historico: 'Histórico', ajustes: 'Ajustes' };

  /* ---------- dados (localStorage) ---------- */

  const KEY = 'meus-ganhos:v1';
  let storageOk = true;

  const vazio = () => ({ entries: [], bills: {}, settings: { name: '', goal: 0 }, lastBackup: null, snooze: 0 });

  function limparRegistro(e) {
    if (!e || typeof e !== 'object') return null;
    if (typeof e.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return null;
    if (ymd(parse(e.date)) !== e.date) return null;
    return {
      id: typeof e.id === 'string' && e.id ? e.id.slice(0, 64) : uid(),
      date: e.date,
      cents: clampInt(e.cents, 0, 99999999999),
      minutes: clampInt(e.minutes, 0, 1440),
      note: String(e.note || '').slice(0, 120),
      at: Number.isFinite(e.at) ? e.at : Date.now(),
    };
  }

  // contas do mês: { 'AAAA-MM': [ { id, name, cents, day, repeat, paidAt } ] }
  function limparConta(c) {
    if (!c || typeof c !== 'object') return null;
    const nome = String(c.name || '').trim().slice(0, 40);
    if (!nome) return null;
    return {
      id: typeof c.id === 'string' && c.id ? c.id.slice(0, 64) : uid(),
      name: nome,
      cents: clampInt(c.cents, 0, 99999999999),
      day: clampInt(c.day, 1, 31),
      repeat: c.repeat !== false,
      paidAt: Number.isFinite(c.paidAt) ? c.paidAt : null,
    };
  }

  function limparContas(obj) {
    const out = {};
    if (!obj || typeof obj !== 'object') return out;
    for (const k of Object.keys(obj)) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(k) || !Array.isArray(obj[k])) continue;
      const vistos = new Set();
      out[k] = obj[k].map(limparConta).filter(c => c && !vistos.has(c.id) && vistos.add(c.id));
    }
    return out;
  }

  function carregar() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { storageOk = false; return vazio(); }
    if (!raw) return vazio();
    try {
      const d = JSON.parse(raw);
      const out = vazio();
      if (Array.isArray(d.entries)) out.entries = d.entries.map(limparRegistro).filter(Boolean);
      out.bills = limparContas(d.bills);
      if (d.settings) {
        out.settings.name = String(d.settings.name || '').slice(0, 40);
        out.settings.goal = clampInt(d.settings.goal, 0, 99999999999);
      }
      out.lastBackup = Number.isFinite(d.lastBackup) ? d.lastBackup : null;
      out.snooze = Number.isFinite(d.snooze) ? d.snooze : 0;
      return out;
    } catch (e) {
      // dado corrompido: guarda uma cópia antes de seguir, para não perder nada
      try { localStorage.setItem(KEY + ':corrompido', raw); } catch (_) { /* sem espaço */ }
      return vazio();
    }
  }

  let db = carregar();

  function salvar() {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      storageOk = true;
      pedirArmazenamentoPersistente();
      return true;
    } catch (e) {
      storageOk = false;
      toast('Não consegui salvar neste navegador. Confira se a navegação privada está desligada.');
      return false;
    }
  }

  let pediuPersistencia = false;
  function pedirArmazenamentoPersistente() {
    if (pediuPersistencia) return;
    pediuPersistencia = true;
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* ok */ }
  }

  /* ---------- cálculos ---------- */

  const doMes = k => db.entries.filter(e => e.date.startsWith(k));

  function porDia(lista) {
    const m = new Map();
    for (const e of lista) {
      const r = m.get(e.date) || { cents: 0, minutes: 0, n: 0 };
      r.cents += e.cents; r.minutes += e.minutes; r.n++;
      m.set(e.date, r);
    }
    return m;
  }

  function resumo(lista) {
    const dias = porDia(lista);
    let cents = 0, minutes = 0, rc = 0, rm = 0;
    for (const e of lista) {
      cents += e.cents; minutes += e.minutes;
      if (e.minutes > 0) { rc += e.cents; rm += e.minutes; }   // valor/hora só com registros que têm horas
    }
    let melhor = null;
    for (const [date, r] of dias) if (!melhor || r.cents > melhor.cents) melhor = { date, ...r };
    return {
      cents, minutes, dias: dias.size, byDay: dias, melhor,
      porDia: dias.size ? Math.round(cents / dias.size) : 0,
      porHora: rm ? Math.round(rc / (rm / 60)) : 0,
    };
  }

  /* ---------- estado da tela ---------- */

  const novoRascunho = date => ({ date: date || hoje(), cents: 0, h: '', m: '', note: '' });
  const state = {
    view: 'registrar',
    month: mesAtual(),
    cmonth: mesAtual(),
    cform: null,
    range: 6,
    hist: null,
    histLimit: 60,
    draft: novoRascunho(),
    editing: null,
  };

  const view = $('#view');

  /* ---------- aviso rápido e diálogo ---------- */

  let toastTimer;
  function toast(msg, acao) {
    const t = $('#toast');
    t.innerHTML = `<span>${esc(msg)}</span>${acao ? `<button type="button">${esc(acao.label)}</button>` : ''}`;
    t.classList.add('show');
    if (acao) $('button', t).onclick = () => { acao.fn(); esconderToast(); };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(esconderToast, acao ? 8000 : 3400);
  }
  function esconderToast() { $('#toast').classList.remove('show'); }

  function perguntar({ title, text, ok = 'Confirmar', cancel = 'Cancelar', danger = false }) {
    const dlg = $('#dlg');
    if (!dlg.showModal) return Promise.resolve(window.confirm(`${title}\n\n${text}`));
    $('#dlg-title').textContent = title;
    $('#dlg-text').textContent = text;
    const okb = $('#dlg-ok');
    okb.textContent = ok;
    okb.className = 'btn' + (danger ? ' danger-solid' : '');
    $('#dlg-cancel').textContent = cancel;
    return new Promise(res => {
      dlg.returnValue = '';
      dlg.addEventListener('close', () => res(dlg.returnValue === 'ok'), { once: true });
      dlg.showModal();
    });
  }

  /* ---------- telas ---------- */

  function saudacao() {
    const h = new Date().getHours();
    const base = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    return db.settings.name ? `${base}, ${esc(db.settings.name)}` : base;
  }

  function linhaRegistro(e) {
    return `<li class="row">
      <div class="row-main">
        <strong class="amt">${dinheiro(e.cents)}</strong>
        <span class="meta">${e.minutes ? horas(e.minutes) + ' trabalhadas' : 'sem horas informadas'}</span>
        ${e.note ? `<span class="note">${esc(e.note)}</span>` : ''}
      </div>
      <div class="row-act">
        <button class="icon" data-act="edit" data-id="${esc(e.id)}" aria-label="Editar o registro de ${dinheiro(e.cents)}">${ICON.edit}</button>
        <button class="icon" data-act="del" data-id="${esc(e.id)}" aria-label="Apagar o registro de ${dinheiro(e.cents)}">${ICON.trash}</button>
      </div>
    </li>`;
  }

  function lembreteBackup() {
    const dia = 864e5;
    if (db.entries.length < 5 || Date.now() < db.snooze) return '';
    if (db.lastBackup && Date.now() - db.lastBackup < 30 * dia) return '';
    return `<div class="notice">
      <strong>Que tal guardar um backup?</strong>
      <p>Seus ganhos ficam só neste aparelho. Se os dados do navegador forem limpos, eles se perdem.</p>
      <div class="row-btns">
        <button class="btn small" data-act="gobackup">Fazer backup</button>
        <button class="btn small ghost" data-act="snooze">Agora não</button>
      </div>
    </div>`;
  }

  function viewRegistrar() {
    const d = state.draft, t = hoje();
    const lista = db.entries.filter(e => e.date === d.date).sort((a, b) => b.at - a.at);
    const tot = lista.reduce((a, e) => a + e.cents, 0);
    const min = lista.reduce((a, e) => a + e.minutes, 0);
    const dm = (parseInt(d.h, 10) || 0) * 60 + (parseInt(d.m, 10) || 0);
    const chipsH = [2, 4, 6, 8].map(h =>
      `<button type="button" class="chip" data-act="hours" data-v="${h}" aria-pressed="${dm === h * 60}">${h}h</button>`).join('');

    const mk = mesAtual();
    const sm = resumo(doMes(mk));
    const meta = db.settings.goal;

    return `
      <header class="hello">
        <h1>${saudacao()}</h1>
        <p>${diaLongo(t)}</p>
      </header>

      ${storageOk ? '' : `<div class="notice warn"><strong>Não dá para salvar neste navegador</strong><p>Os dados podem ser perdidos ao fechar. Saia da navegação privada ou abra o app em outro navegador.</p></div>`}
      <div id="slot-install">${instalarCard() || lembreteBackup()}</div>

      <section class="ledger" aria-label="Novo registro">
        <div class="ledger-top">
          ${state.editing ? '<span class="editing">Editando um registro</span>' : ''}
          <label class="ledger-q" for="f-amount">Quanto você ganhou?</label>
          <div class="amount">
            <span class="cur" aria-hidden="true">R$</span>
            <input id="f-amount" inputmode="numeric" autocomplete="off" placeholder="0,00"
                   value="${d.cents ? nf2.format(d.cents / 100) : ''}" aria-describedby="f-err">
          </div>
        </div>

        <div class="ledger-body">
          <fieldset class="field">
            <legend>Dia</legend>
            <div class="chips">
              <button type="button" class="chip" data-act="date" data-v="${t}" aria-pressed="${d.date === t}">Hoje</button>
              <button type="button" class="chip" data-act="date" data-v="${somaDias(t, -1)}" aria-pressed="${d.date === somaDias(t, -1)}">Ontem</button>
              <input type="date" id="f-date" class="in chip chip-date${d.date !== t && d.date !== somaDias(t, -1) ? ' active' : ''}"
                     value="${d.date}" max="${t}" aria-label="Escolher outro dia">
            </div>
          </fieldset>

          <fieldset class="field">
            <legend>Horas trabalhadas</legend>
            <div class="hm">
              <label class="num"><input id="f-h" inputmode="numeric" maxlength="2" placeholder="0" value="${esc(d.h)}" aria-label="Horas"><span>h</span></label>
              <label class="num"><input id="f-m" inputmode="numeric" maxlength="2" placeholder="0" value="${esc(d.m)}" aria-label="Minutos"><span>min</span></label>
            </div>
            <div class="chips">${chipsH}</div>
          </fieldset>

          <div class="field">
            <label for="f-note">Observação <span class="opt">(opcional)</span></label>
            <input id="f-note" class="in" maxlength="120" placeholder="Ex.: cliente, serviço, local" value="${esc(d.note)}">
          </div>

          <p id="f-err" class="err" role="alert"></p>

          <div class="actions">
            <button type="button" class="btn" data-act="save">${state.editing ? 'Salvar alterações' : 'Salvar ganho'}</button>
            ${state.editing ? '<button type="button" class="btn ghost" data-act="cancel">Cancelar</button>' : ''}
          </div>
        </div>
      </section>

      <section class="sec" aria-labelledby="day-h">
        <div class="sec-head">
          <h2 id="day-h">${d.date === t ? 'Hoje' : diaLongo(d.date)}</h2>
          ${lista.length ? `<span class="sec-total">${dinheiro(tot)}</span>` : ''}
        </div>
        ${lista.length
          ? `${min ? `<p class="sec-sub">${horas(min)} trabalhadas no dia</p>` : ''}<ul class="rows">${lista.map(linhaRegistro).join('')}</ul>`
          : `<p class="empty">Nada registrado ${d.date === t ? 'hoje' : 'neste dia'} ainda. Preencha acima e toque em “Salvar ganho”.</p>`}
      </section>

      ${sm.cents ? `
      <button type="button" class="glance" data-act="glance">
        <span class="g-main">
          <span class="g-l">${nomeMes(mk).replace(/^./, c => c.toUpperCase())} até agora</span>
          <span class="g-v">${dinheiro(sm.cents)}</span>
          ${meta ? `<div class="meter" aria-hidden="true"><span style="width:${Math.min(100, sm.cents / meta * 100)}%"></span></div>` : ''}
        </span>
        ${ICON.right}
      </button>` : ''}
    `;
  }

  function viewMes() {
    const key = state.month, cur = mesAtual(), ehAtual = key === cur;
    const lista = doMes(key), s = resumo(lista);
    const nDias = diasNoMes(key);
    const diaHoje = ehAtual ? new Date().getDate() : nDias;
    const meta = db.settings.goal;

    const primeiro = db.entries.length ? db.entries.map(e => mesDe(e.date)).sort()[0] : cur;
    const podeVoltar = key > primeiro;

    // comparação com o mês anterior (no mês corrente, compara o mesmo período)
    const antKey = somaMeses(key, -1);
    const antLista = doMes(antKey).filter(e => !ehAtual || Number(e.date.slice(8)) <= diaHoje);
    const ant = resumo(antLista).cents;
    let delta = '';
    if (s.cents > 0 && ant > 0) {
      const pct = Math.round((s.cents - ant) / ant * 100);
      const alvo = ehAtual ? `do mesmo período de ${nomeMes(antKey)}` : `de ${nomeMes(antKey)}`;
      if (pct === 0) delta = `<p class="delta"><span>No mesmo ritmo ${alvo}</span></p>`;
      else delta = `<p class="delta"><span class="dicon ${pct > 0 ? 'up' : 'down'}">${pct > 0 ? ICON.up : ICON.down}</span><span>${Math.abs(pct)}% ${pct > 0 ? 'acima' : 'abaixo'} ${alvo}</span></p>`;
    }

    let metaHtml = '';
    if (meta > 0) {
      const p = s.cents / meta;
      metaHtml = `<div class="goal">
        <p class="goal-line"><span>Meta de ${dinheiroInt(meta)}</span><span>${Math.round(p * 100)}%</span></p>
        <div class="meter" role="progressbar" aria-label="Progresso da meta" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, Math.round(p * 100))}"><span style="width:${Math.min(100, p * 100)}%"></span></div>
        <p class="goal-sub">${p >= 1 ? 'Meta batida! 🎉' : `Faltam ${dinheiro(meta - s.cents)}`}</p>
      </div>`;
    }
    let proj = '';
    if (ehAtual && diaHoje >= 5 && s.cents > 0 && diaHoje < nDias) {
      proj = `<p class="proj">Se mantiver o ritmo até aqui, o mês fecha perto de ${dinheiroInt(s.cents / diaHoje * nDias)} (é só uma estimativa).</p>`;
    }

    const cab = `
      <div class="monthnav">
        <button class="icon" data-act="prev" aria-label="Mês anterior" ${podeVoltar ? '' : 'disabled'}>${ICON.left}</button>
        <h1>${maiuscula(rotuloMes(key))}</h1>
        <button class="icon" data-act="next" aria-label="Próximo mês" ${ehAtual ? 'disabled' : ''}>${ICON.right}</button>
      </div>`;

    if (!s.cents && !s.minutes) {
      return `${cab}
        <div class="hero"><p class="lbl">Total do mês</p><p class="big">${dinheiro(0)}</p>${metaHtml}</div>
        <p class="empty">Nenhum ganho registrado em ${nomeMes(key)}.
          ${ehAtual ? '<br><button class="btn" data-act="gotoreg">Registrar o primeiro ganho</button>' : ''}</p>`;
    }

    const rows = [];
    rows.push(['Dias trabalhados', `${s.dias}<small>de ${diaHoje} ${ehAtual ? 'dias até hoje' : 'dias do mês'}</small>`]);
    rows.push(['Horas trabalhadas', s.minutes ? horas(s.minutes) : '—']);
    rows.push(['Média por dia trabalhado', dinheiro(s.porDia)]);
    rows.push(['Ganho médio por hora', s.porHora ? dinheiro(s.porHora) : '—']);
    if (s.melhor) rows.push(['Melhor dia', `${dinheiro(s.melhor.cents)}<small>${rotuloDia(s.melhor.date)}</small>`]);

    return `${cab}
      <section class="hero" aria-label="Resumo do mês">
        <p class="lbl">Total do mês</p>
        <p class="big">${dinheiro(s.cents)}</p>
        ${delta}${metaHtml}${proj}
      </section>

      <section class="panel flat" aria-label="Números do mês">
        <dl class="led">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </section>

      <section class="panel">
        <h2>Ganhos por dia</h2>
        <p class="cap">Valores em reais. Toque numa barra para ver o dia.</p>
        <div class="chart" data-chart="daily"></div>
      </section>

      <section class="panel">
        <h2>Andamento no mês</h2>
        <p class="cap">Quanto você já juntou, somando dia após dia.</p>
        <div class="chart" data-chart="cumul"></div>
        ${tabelaMes(key, s)}
      </section>`;
  }

  function tabelaMes(key, s) {
    let acum = 0, trs = '';
    for (let d = 1; d <= diasNoMes(key); d++) {
      const ds = `${key}-${pad(d)}`, r = s.byDay.get(ds);
      if (!r) continue;
      acum += r.cents;
      trs += `<tr><td>${rotuloDia(ds)}</td><td class="n">${nf2.format(r.cents / 100)}</td><td class="n">${nf2.format(acum / 100)}</td><td class="n">${r.minutes ? horas(r.minutes) : '—'}</td></tr>`;
    }
    return `<details class="tbl"><summary>Ver em tabela</summary>
      <table><thead><tr><th>Dia</th><th class="n">No dia (R$)</th><th class="n">Acumulado (R$)</th><th class="n">Horas</th></tr></thead><tbody>${trs}</tbody></table></details>`;
  }

  /* ---------- contas do mês ---------- */

  const SUGESTOES_CONTA = ['Aluguel', 'Luz', 'Água', 'Internet', 'Celular', 'Cartão', 'Mercado'];
  const novoFormConta = () => ({ id: null, name: '', cents: 0, day: '', repeat: true });
  const focar = seletor => { const el = $(seletor); if (el) el.focus(); };
  const diaVenc = (c, key) => Math.min(c.day, diasNoMes(key));
  const somaCents = lista => lista.reduce((a, c) => a + c.cents, 0);

  // O mês atual nasce como cópia das contas "todo mês" do último mês que tinha contas.
  // Meses passados nunca são preenchidos sozinhos.
  function contasDoMes(key) {
    if (db.bills[key] === undefined && key === mesAtual()) {
      const antes = Object.keys(db.bills).filter(k => k < key).sort().pop();
      db.bills[key] = antes
        ? db.bills[antes].filter(c => c.repeat)
          .map(c => ({ id: uid(), name: c.name, cents: c.cents, day: c.day, repeat: true, paidAt: null }))
        : [];
      salvar();
    }
    return db.bills[key] || [];
  }

  function statusConta(c, key) {
    const dv = diaVenc(c, key);
    if (c.paidAt) {
      const d = new Date(c.paidAt);
      return { txt: `Paga em ${d.getDate()} ${MES3[d.getMonth()]}`, tom: 'ok' };
    }
    if (key !== mesAtual()) return { txt: `Não paga, venceu dia ${dv}`, tom: 'late' };
    const dif = dv - new Date().getDate();
    if (dif < 0) return { txt: `Atrasada há ${-dif} ${-dif === 1 ? 'dia' : 'dias'}`, tom: 'late' };
    if (dif === 0) return { txt: 'Vence hoje', tom: 'soon' };
    if (dif === 1) return { txt: 'Vence amanhã', tom: 'soon' };
    if (dif <= 3) return { txt: `Vence em ${dif} dias`, tom: 'soon' };
    return { txt: `Vence dia ${dv}`, tom: '' };
  }

  function linhaConta(c, key) {
    const st = statusConta(c, key), paga = !!c.paidAt;
    return `<li class="bill${paga ? ' paid' : ''}">
      <button type="button" class="tick" data-act="cpaid" data-id="${esc(c.id)}" aria-pressed="${paga}" aria-label="Paga: ${esc(c.name)}">${paga ? ICON.check : ''}</button>
      <button type="button" class="bill-main" data-act="cedit" data-id="${esc(c.id)}" aria-label="Editar ${esc(c.name)}, ${dinheiro(c.cents)}">
        <span class="b-txt"><span class="b-name">${esc(c.name)}</span><span class="b-meta ${st.tom}">${st.txt}</span></span>
        <span class="b-amt">${dinheiro(c.cents)}</span>
      </button>
    </li>`;
  }

  function formConta() {
    const f = state.cform, ed = !!f.id;
    const sugestoes = !ed && !f.name
      ? `<div class="chips sug">${SUGESTOES_CONTA.map(n => `<button type="button" class="chip" data-act="cname" data-v="${n}">${n}</button>`).join('')}</div>`
      : '';
    return `<section class="ledger" aria-label="${ed ? 'Editar conta' : 'Nova conta'}">
      <div class="ledger-top">
        ${ed ? '<span class="editing">Editando uma conta</span>' : ''}
        <label class="ledger-q" for="c-amount">Quanto é a conta?</label>
        <div class="amount">
          <span class="cur" aria-hidden="true">R$</span>
          <input id="c-amount" inputmode="numeric" autocomplete="off" placeholder="0,00"
                 value="${f.cents ? nf2.format(f.cents / 100) : ''}" aria-describedby="c-err">
        </div>
      </div>
      <div class="ledger-body">
        <div class="field">
          <label for="c-name">Nome da conta</label>
          <input id="c-name" class="in" maxlength="40" autocomplete="off" placeholder="Ex.: aluguel, luz, internet" value="${esc(f.name)}">
          ${sugestoes}
        </div>
        <div class="field">
          <label for="c-day">Dia do vencimento <span class="opt">(1 a 31)</span></label>
          <input id="c-day" class="in" inputmode="numeric" maxlength="2" autocomplete="off" placeholder="Ex.: 10" value="${esc(f.day)}">
        </div>
        <fieldset class="field">
          <legend>Repetição</legend>
          <div class="chips">
            <button type="button" class="chip" data-act="crepeat" data-v="1" aria-pressed="${f.repeat}">Todo mês</button>
            <button type="button" class="chip" data-act="crepeat" data-v="0" aria-pressed="${!f.repeat}">Só neste mês</button>
          </div>
        </fieldset>
        <p id="c-err" class="err" role="alert"></p>
        <div class="actions">
          <button type="button" class="btn" data-act="csave">${ed ? 'Salvar alterações' : 'Salvar conta'}</button>
          <button type="button" class="btn ghost" data-act="ccancel">Cancelar</button>
          ${ed ? '<button type="button" class="btn danger" data-act="cdel">Apagar conta</button>' : ''}
        </div>
      </div>
    </section>`;
  }

  function viewContas() {
    const key = state.cmonth, ehAtual = key === mesAtual();
    const lista = contasDoMes(key).slice()
      .sort((a, b) => diaVenc(a, key) - diaVenc(b, key) || a.name.localeCompare(b.name, 'pt-BR'));
    const primeiro = Object.keys(db.bills).sort()[0] || mesAtual();

    const cab = `
      <div class="monthnav">
        <button class="icon" data-act="cprev" aria-label="Mês anterior" ${key > primeiro ? '' : 'disabled'}>${ICON.left}</button>
        <h1><span class="sr-only">Contas de </span>${maiuscula(rotuloMes(key))}</h1>
        <button class="icon" data-act="cnext" aria-label="Próximo mês" ${ehAtual ? 'disabled' : ''}>${ICON.right}</button>
      </div>`;

    if (state.cform) return `${cab}${formConta()}`;

    if (!lista.length) {
      return `${cab}
        <p class="empty">Nenhuma conta em ${nomeMes(key)}.${ehAtual ? ' Adicione as contas fixas, como aluguel, luz e internet. No mês seguinte, elas aparecem sozinhas.' : ''}
          <br><button class="btn" data-act="cnew">Adicionar conta</button></p>`;
    }

    const total = somaCents(lista);
    const pend = lista.filter(c => !c.paidAt), pagas = lista.filter(c => c.paidAt);
    const falta = somaCents(pend);
    const pct = total ? Math.round((total - falta) / total * 100) : 0;
    const atrasadas = ehAtual ? pend.filter(c => statusConta(c, key).tom === 'late').length : 0;
    const sub = falta
      ? `Falta pagar ${dinheiro(falta)}.${atrasadas ? ` ${atrasadas} ${atrasadas === 1 ? 'conta atrasada' : 'contas atrasadas'}.` : ''}`
      : 'Todas as contas estão pagas.';

    const ganhos = resumo(doMes(key)).cents, dif = ganhos - total;

    const bloco = (id, titulo, itens) => itens.length ? `
      <section class="sec" aria-labelledby="${id}">
        <div class="sec-head"><h2 id="${id}">${titulo}</h2><span class="sec-total">${dinheiro(somaCents(itens))}</span></div>
        <ul class="bills">${itens.map(c => linhaConta(c, key)).join('')}</ul>
      </section>` : '';

    return `${cab}
      <section class="hero" aria-label="Resumo das contas">
        <p class="lbl">Contas do mês</p>
        <p class="big">${dinheiro(total)}</p>
        <div class="goal">
          <p class="goal-line"><span>Pago ${dinheiro(total - falta)}</span><span>${pct}%</span></p>
          <div class="meter" role="progressbar" aria-label="Contas pagas" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
          <p class="goal-sub">${sub}</p>
        </div>
      </section>

      ${bloco('b-pend', ehAtual ? 'A pagar' : 'Não pagas', pend)}
      ${bloco('b-pagas', 'Pagas', pagas)}

      <section class="panel flat" aria-label="Contas e ganhos">
        <dl class="led">
          <div><dt>Ganhos ${ehAtual ? 'até agora' : 'do mês'}</dt><dd>${dinheiro(ganhos)}</dd></div>
          <div><dt>Contas do mês</dt><dd>${dinheiro(total)}</dd></div>
          <div><dt>${dif >= 0 ? 'Sobra depois das contas' : 'Falta para cobrir as contas'}</dt><dd class="${dif < 0 ? 'neg' : ''}">${dinheiro(Math.abs(dif))}</dd></div>
        </dl>
      </section>

      <div class="actions sec"><button class="btn soft" data-act="cnew">Adicionar conta</button></div>`;
  }

  function erroConta(msg, seletor) {
    const el = $('#c-err');
    if (el) el.textContent = msg;
    focar(seletor);
  }

  function salvarConta() {
    const f = state.cform, nome = f.name.trim(), dia = parseInt(f.day, 10);
    if (!nome) return erroConta('Escreva o nome da conta.', '#c-name');
    if (!f.cents) return erroConta('Informe o valor da conta.', '#c-amount');
    if (!(dia >= 1 && dia <= 31)) return erroConta('Informe o dia do vencimento, de 1 a 31.', '#c-day');

    const lista = db.bills[state.cmonth] || (db.bills[state.cmonth] = []);
    const dados = { name: nome, cents: f.cents, day: dia, repeat: f.repeat };
    const novo = !f.id;
    if (novo) lista.push({ id: uid(), paidAt: null, ...dados });
    else { const c = lista.find(x => x.id === f.id); if (c) Object.assign(c, dados); }
    if (!salvar()) return;
    state.cform = null;
    render();
    toast(novo ? 'Conta salva' : 'Alterações salvas');
  }

  function editarConta(id) {
    const c = (db.bills[state.cmonth] || []).find(x => x.id === id);
    if (!c) return;
    state.cform = { id: c.id, name: c.name, cents: c.cents, day: String(c.day), repeat: c.repeat };
    render();
    window.scrollTo(0, 0);
  }

  function alternarPaga(id) {
    const c = (db.bills[state.cmonth] || []).find(x => x.id === id);
    if (!c) return;
    const antes = c.paidAt;
    c.paidAt = antes ? null : Date.now();
    if (!salvar()) { c.paidAt = antes; return; }
    render();
    focar(`[data-act="cpaid"][data-id="${CSS.escape(id)}"]`);
  }

  function apagarConta(id) {
    const key = state.cmonth, lista = db.bills[key] || [];
    const i = lista.findIndex(c => c.id === id);
    if (i < 0) return;
    const [c] = lista.splice(i, 1);
    if (!salvar()) { lista.splice(i, 0, c); return; }
    state.cform = null;
    render();
    toast(c.repeat && key === mesAtual() ? 'Conta apagada. Ela não volta nos próximos meses.' : 'Conta apagada', {
      label: 'Desfazer',
      fn: () => {
        const l = db.bills[key] || (db.bills[key] = []);
        l.splice(Math.min(i, l.length), 0, c);
        salvar(); render();
      },
    });
  }

  function mesesEvolucao() {
    const cur = mesAtual();
    const primeiro = db.entries.length ? db.entries.map(e => mesDe(e.date)).sort()[0] : cur;
    let ini = somaMeses(cur, -(state.range - 1));
    if (primeiro > ini) ini = primeiro;
    if (difMeses(ini, cur) < 2) ini = somaMeses(cur, -2);
    const out = [];
    for (let k = ini; k <= cur; k = somaMeses(k, 1)) out.push({ key: k, ...resumo(doMes(k)) });
    return out;
  }

  function viewEvolucao() {
    const cab = `<header class="hello"><h1>Evolução</h1><p>Como seus ganhos andam de mês em mês.</p></header>`;
    if (!db.entries.length) {
      return `${cab}<p class="empty">Quando você tiver alguns dias registrados, a evolução aparece aqui.
        <br><button class="btn" data-act="gotoreg">Registrar um ganho</button></p>`;
    }
    const cur = mesAtual();
    const meses = mesesEvolucao();
    const total = meses.reduce((a, m) => a + m.cents, 0);
    const completos = meses.filter(m => m.key !== cur && m.cents > 0);
    const media = completos.length ? Math.round(completos.reduce((a, m) => a + m.cents, 0) / completos.length) : null;
    const melhor = meses.reduce((a, m) => (m.cents > a.cents ? m : a), meses[0]);
    const comRate = meses.filter(m => m.porHora > 0);

    const diasComDado = new Set(db.entries.map(e => e.date)).size;

    const trs = meses.slice().reverse().map(m => `<tr>
      <td>${mes3(m.key)}/${m.key.slice(2, 4)}</td>
      <td class="n">${nf2.format(m.cents / 100)}</td>
      <td class="n">${m.minutes ? horas(m.minutes) : '—'}</td>
      <td class="n">${m.porHora ? nf2.format(m.porHora / 100) : '—'}</td></tr>`).join('');

    return `${cab}
      <div class="seg" role="group" aria-label="Período">
        <button data-act="range" data-v="6" aria-pressed="${state.range === 6}">6 meses</button>
        <button data-act="range" data-v="12" aria-pressed="${state.range === 12}">12 meses</button>
      </div>

      <section class="panel">
        <h2>Ganhos por mês</h2>
        <p class="cap">Em verde, o mês atual. Valores em reais.</p>
        <div class="chart" data-chart="months"></div>
      </section>

      <section class="panel flat" aria-label="Resumo do período">
        <dl class="led">
          <div><dt>Total no período</dt><dd>${dinheiro(total)}</dd></div>
          <div><dt>Média dos meses anteriores</dt><dd>${media !== null ? dinheiro(media) : '—'}${media === null ? '<small>ainda não há mês anterior</small>' : ''}</dd></div>
          <div><dt>Melhor mês</dt><dd>${melhor.cents ? dinheiro(melhor.cents) : '—'}${melhor.cents ? `<small>${nomeMes(melhor.key)} de ${melhor.key.slice(0, 4)}</small>` : ''}</dd></div>
        </dl>
      </section>

      <section class="panel">
        <h2>Ganho por hora</h2>
        <p class="cap">Média de cada mês, só com os registros que têm horas.</p>
        ${comRate.length >= 2
          ? '<div class="chart" data-chart="rate"></div>'
          : '<p class="empty" style="margin-top:0">Registre as horas em pelo menos dois meses para ver como seu ganho por hora evolui.</p>'}
      </section>

      ${diasComDado >= 5 ? `
      <section class="panel">
        <h2>Quais dias rendem mais</h2>
        <p class="cap">Média por dia trabalhado, com todos os seus registros.</p>
        <div class="chart" data-chart="weekday"></div>
      </section>` : ''}

      <section class="panel">
        <h2>Mês a mês</h2>
        <table>
          <thead><tr><th>Mês</th><th class="n">Total (R$)</th><th class="n">Horas</th><th class="n">R$/hora</th></tr></thead>
          <tbody>${trs}</tbody>
        </table>
      </section>`;
  }

  function blocoDia(ds, itens) {
    const d = parse(ds), fim = d.getDay() === 0 || d.getDay() === 6;
    const tot = itens.reduce((a, e) => a + e.cents, 0), min = itens.reduce((a, e) => a + e.minutes, 0);
    const cab = itens.length > 1
      ? `<div class="daytot"><strong>${dinheiro(tot)}</strong><span>${min ? horas(min) + ' no dia' : ''}</span></div>` : '';
    return `<article class="dayblock">
      <div class="stamp${fim ? ' wk' : ''}"><span class="d">${d.getDate()}</span><span class="w">${DIA3[d.getDay()]}</span></div>
      <div class="dayrows">${cab}<ul class="rows">${itens.map(linhaRegistro).join('')}</ul></div>
    </article>`;
  }

  function viewHistorico() {
    const cab = `<header class="hello"><h1>Histórico</h1><p>Tudo o que você já registrou.</p></header>`;
    const chaves = [...new Set(db.entries.map(e => mesDe(e.date)))].sort().reverse();
    if (!chaves.length) {
      return `${cab}<p class="empty">Ainda não há registros. Seus ganhos aparecem aqui, dia por dia.
        <br><button class="btn" data-act="gotoreg">Registrar um ganho</button></p>`;
    }
    const cur = mesAtual();
    let sel = state.hist;
    if (sel !== 'all' && !chaves.includes(sel)) sel = chaves.includes(cur) ? cur : chaves[0];
    state.hist = sel;

    const lista = (sel === 'all' ? db.entries : doMes(sel)).slice()
      .sort((a, b) => (a.date === b.date ? b.at - a.at : (a.date < b.date ? 1 : -1)));
    const porData = new Map();
    for (const e of lista) { if (!porData.has(e.date)) porData.set(e.date, []); porData.get(e.date).push(e); }
    const datas = [...porData.keys()];
    const mostrar = datas.slice(0, state.histLimit);
    const s = resumo(lista);

    let html = '', ultimo = '';
    for (const ds of mostrar) {
      const mk = mesDe(ds);
      if (sel === 'all' && mk !== ultimo) {
        ultimo = mk;
        html += `<div class="msep"><h3>${rotuloMes(mk)}</h3><span>${dinheiro(resumo(doMes(mk)).cents)}</span></div>`;
      }
      html += blocoDia(ds, porData.get(ds));
    }

    return `${cab}
      <div class="toolbar">
        <label for="h-month">Mostrar</label>
        <select id="h-month" class="in">
          ${chaves.map(k => `<option value="${k}"${sel === k ? ' selected' : ''}>${rotuloMes(k)}</option>`).join('')}
          <option value="all"${sel === 'all' ? ' selected' : ''}>Todos os meses</option>
        </select>
      </div>
      <p class="sec-sub">${s.dias} ${s.dias === 1 ? 'dia' : 'dias'} com ganhos, total de <strong>${dinheiro(s.cents)}</strong>${s.minutes ? ` em ${horas(s.minutes)}` : ''}.</p>
      ${html}
      ${datas.length > mostrar.length ? '<button class="btn ghost more" data-act="more">Mostrar mais dias</button>' : ''}`;
  }

  function viewAjustes() {
    const quando = db.lastBackup
      ? `Último backup: ${diaLongo(ymd(new Date(db.lastBackup)))}.`
      : 'Você ainda não fez nenhum backup.';
    const podeCompartilhar = !!(navigator.canShare && navigator.share);
    return `
      <header class="hello"><h1>Ajustes</h1><p>Deixe o app com a sua cara.</p></header>

      <section class="group">
        <div class="stack">
          <div class="field">
            <label for="s-name">Seu nome</label>
            <input id="s-name" class="in" maxlength="40" autocomplete="given-name" placeholder="Como você quer ser chamada?" value="${esc(db.settings.name)}">
          </div>
          <div class="field">
            <label for="s-goal">Meta de ganhos do mês <span class="opt">(opcional)</span></label>
            <input id="s-goal" class="in" inputmode="numeric" autocomplete="off" placeholder="R$ 0,00" value="${db.settings.goal ? 'R$ ' + nf2.format(db.settings.goal / 100) : ''}">
          </div>
        </div>
      </section>

      <section class="group">
        <h2>Backup dos dados</h2>
        <p>Seus ganhos ficam salvos só neste aparelho. Guarde um backup de vez em quando, por exemplo no WhatsApp ou no e-mail. ${quando}</p>
        <div class="actions">
          ${podeCompartilhar ? '<button class="btn" data-act="share">Enviar backup</button>' : ''}
          <button class="btn ${podeCompartilhar ? 'ghost' : ''}" data-act="backup">Baixar backup</button>
          <button class="btn ghost" data-act="restore">Restaurar de um backup</button>
          <button class="btn ghost" data-act="csv">Exportar para planilha (CSV)</button>
        </div>
        <input id="f-restore" class="sr-only" type="file" accept=".json,application/json" tabindex="-1" aria-label="Escolher arquivo de backup">
      </section>

      <section class="group" id="grp-install">${instalarGrupo()}</section>

      <section class="group">
        <h2>Apagar tudo</h2>
        <p>Remove todos os registros e ajustes deste aparelho. Não dá para desfazer.</p>
        <div class="actions"><button class="btn danger" data-act="wipe">Apagar todos os dados</button></div>
      </section>

      <p class="foot">Meus Ganhos, versão 1.2</p>`;
  }

  /* ---------- instalação como aplicativo (PWA) ---------- */

  const INSTALL_KEY = 'meus-ganhos:instalar-dispensado';
  let promptInstalacao = null;   // evento "beforeinstallprompt" guardado (Chrome, Edge e Android)

  const emApp = () =>
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const ehIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function instalacaoDispensada() {
    try { return Date.now() < Number(localStorage.getItem(INSTALL_KEY) || 0); } catch (e) { return false; }
  }
  function dispensarInstalacao() {
    try { localStorage.setItem(INSTALL_KEY, String(Date.now() + 14 * 864e5)); } catch (e) { /* ok */ }
  }

  function instalarCard() {
    if (emApp() || instalacaoDispensada()) return '';
    if (promptInstalacao) {
      return `<div class="notice lav">
        <strong>Instale o app no seu celular</strong>
        <p>Ele abre em tela cheia, como um aplicativo, e funciona sem internet.</p>
        <div class="row-btns">
          <button class="btn small" data-act="install">Instalar aplicativo</button>
          <button class="btn small ghost" data-act="install-later">Agora não</button>
        </div>
      </div>`;
    }
    if (ehIOS()) {
      return `<div class="notice lav">
        <strong>Instale o app no seu iPhone</strong>
        <p>Na tela inicial, ele abre em tela cheia, como um aplicativo, e funciona sem internet.</p>
        <div class="row-btns">
          <button class="btn small" data-act="install-help">Ver como instalar</button>
          <button class="btn small ghost" data-act="install-later">Agora não</button>
        </div>
      </div>`;
    }
    return '';
  }

  function instalarGrupo() {
    let corpo;
    if (emApp()) {
      corpo = '<p>Você está usando o app instalado. Ele abre em tela cheia e funciona sem internet.</p>';
    } else if (promptInstalacao) {
      corpo = `<p>Instalado, ele abre em tela cheia como um aplicativo, funciona sem internet e seus dados ficam mais protegidos.</p>
        <div class="actions"><button class="btn" data-act="install">Instalar aplicativo</button></div>`;
    } else {
      const ios = ehIOS(), android = /android/i.test(navigator.userAgent);
      const abrir = ios || android || state.abrirInstalar ? ' open' : '';
      const passosIOS = `<h3>iPhone ou iPad</h3>
          <ol>
            <li>Abra este endereço no Safari. Se você chegou por um link no WhatsApp, toque em “Abrir no Safari” antes.</li>
            <li>Toque no botão de compartilhar, o quadrado com a seta para cima.</li>
            <li>Role a lista e escolha “Adicionar à Tela de Início”.</li>
            <li>Toque em “Adicionar”.</li>
          </ol>`;
      const passosAndroid = `<h3>Android</h3>
          <ol>
            <li>Abra este endereço no Chrome. Se veio de um link no WhatsApp, abra o menu dele e escolha abrir no navegador.</li>
            <li>Toque nos três pontinhos no canto da tela.</li>
            <li>Escolha “Instalar aplicativo” ou “Adicionar à tela inicial” e confirme.</li>
          </ol>`;
      const passosPC = `<h3>Computador</h3>
          <ol><li>No Chrome ou no Edge, clique no ícone de instalar, no fim da barra de endereço.</li></ol>`;
      // mostra só os passos do aparelho em uso; em outro caso, todos
      const passos = ios ? passosIOS : android ? passosAndroid : passosIOS + passosAndroid + passosPC;
      corpo = `<p>Colocando o app na tela inicial, ele abre em tela cheia, funciona sem internet e seus dados ficam mais protegidos.</p>
        <details class="install"${abrir}>
          <summary>Como colocar na tela inicial</summary>
          ${passos}
        </details>`;
    }
    return `<h2>Instalar no celular</h2>${corpo}`;
  }

  // atualiza só os pontos de instalação, sem refazer a tela (não atrapalha quem está digitando)
  function atualizarInstalacao() {
    const slot = $('#slot-install');
    if (slot) slot.innerHTML = instalarCard() || lembreteBackup();
    const grupo = $('#grp-install');
    if (grupo) grupo.innerHTML = instalarGrupo();
  }

  async function instalar() {
    const ev = promptInstalacao;
    if (!ev) return;
    promptInstalacao = null;   // o evento só pode ser usado uma vez
    try {
      ev.prompt();
      const r = await ev.userChoice;
      toast(r && r.outcome === 'accepted' ? 'Instalando o app…' : 'Tudo bem. Você pode instalar depois, em Ajustes.');
    } catch (e) { /* o navegador recusou: segue sem o botão */ }
    atualizarInstalacao();
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    promptInstalacao = e;
    atualizarInstalacao();
  });
  window.addEventListener('appinstalled', () => {
    promptInstalacao = null;
    toast('App instalado. Procure o ícone na tela inicial.');
    atualizarInstalacao();
  });

  const VIEWS = { registrar: viewRegistrar, mes: viewMes, contas: viewContas, evolucao: viewEvolucao, historico: viewHistorico, ajustes: viewAjustes };

  function render() {
    view.innerHTML = VIEWS[state.view]();
    $$('.tab').forEach(a => {
      if (a.dataset.v === state.view) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = `${TABS[state.view]} – Meus Ganhos`;
    desenharGraficos();
  }

  function rota() {
    const h = location.hash.replace('#', '');
    state.view = VIEWS[h] ? h : 'registrar';
    render();
    window.scrollTo(0, 0);
    if (state.abrirInstalar && state.view === 'ajustes') {
      state.abrirInstalar = false;
      const g = $('#grp-install');
      if (g) g.scrollIntoView({ block: 'start' });
    }
  }

  /* ---------- ações ---------- */

  function erro(msg, seletor) {
    const el = $('#f-err');
    if (el) el.textContent = msg;
    const campo = seletor && $(seletor);
    if (campo) campo.focus();
  }

  function salvarRegistro() {
    const d = state.draft;
    const minutos = (parseInt(d.h, 10) || 0) * 60 + (parseInt(d.m, 10) || 0);
    if (!d.cents && !minutos) return erro('Informe o valor ganho ou as horas trabalhadas.', '#f-amount');
    if (minutos > 1440) return erro('As horas de um dia não podem passar de 24h.', '#f-h');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return erro('Escolha o dia do registro.', '#f-date');

    const dados = { date: d.date, cents: d.cents, minutes: minutos, note: d.note.trim().slice(0, 120) };
    let msg;
    if (state.editing) {
      const e = db.entries.find(x => x.id === state.editing);
      if (e) Object.assign(e, dados);
      msg = 'Alterações salvas';
    } else {
      db.entries.push({ id: uid(), at: Date.now(), ...dados });
      msg = 'Ganho salvo';
    }
    if (!salvar()) return;

    const totalDia = db.entries.filter(e => e.date === dados.date).reduce((a, e) => a + e.cents, 0);
    state.editing = null;
    state.draft = novoRascunho(dados.date);
    render();
    toast(`${msg}. Total ${dados.date === hoje() ? 'de hoje' : 'do dia'}: ${dinheiro(totalDia)}`);
  }

  function iniciarEdicao(id) {
    const e = db.entries.find(x => x.id === id);
    if (!e) return;
    state.editing = id;
    state.draft = {
      date: e.date, cents: e.cents, note: e.note,
      h: e.minutes ? String(Math.floor(e.minutes / 60)) : '',
      m: e.minutes % 60 ? String(e.minutes % 60) : '',
    };
    if (state.view === 'registrar') { render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else location.hash = '#registrar';
  }

  function apagarRegistro(id) {
    const i = db.entries.findIndex(e => e.id === id);
    if (i < 0) return;
    const [e] = db.entries.splice(i, 1);
    if (!salvar()) { db.entries.splice(i, 0, e); return; }
    if (state.editing === id) { state.editing = null; state.draft = novoRascunho(e.date); }
    render();
    toast('Registro apagado', {
      label: 'Desfazer',
      fn: () => { db.entries.splice(Math.min(i, db.entries.length), 0, e); salvar(); render(); },
    });
  }

  /* backup, restauração e planilha */

  function baixar(nome, mime, texto) {
    const url = URL.createObjectURL(new Blob([texto], { type: mime }));
    const a = document.createElement('a');
    a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function marcarBackup() { db.lastBackup = Date.now(); salvar(); render(); }

  async function fazerBackup(compartilhar) {
    const nome = `meus-ganhos-backup-${hoje()}.json`;
    const texto = JSON.stringify({
      app: 'meus-ganhos', version: 1, exportedAt: new Date().toISOString(),
      settings: db.settings, entries: db.entries, bills: db.bills,
    }, null, 2);
    if (compartilhar && navigator.canShare && navigator.share) {
      try {
        const arq = new File([texto], nome, { type: 'application/json' });
        if (navigator.canShare({ files: [arq] })) {
          await navigator.share({ files: [arq], title: 'Backup do Meus Ganhos' });
          marcarBackup();
          return;
        }
      } catch (e) {
        if (e && e.name === 'AbortError') return;   // ela fechou a janela de compartilhar
      }
    }
    baixar(nome, 'application/json', texto);
    marcarBackup();
    toast('Backup baixado no aparelho');
  }

  async function restaurar(arquivo) {
    try {
      const d = JSON.parse(await arquivo.text());
      if (!d || !Array.isArray(d.entries)) throw new Error('formato');
      const tenho = new Set(db.entries.map(e => e.id));
      let novos = 0;
      for (const e of d.entries.map(limparRegistro).filter(Boolean)) {
        if (!tenho.has(e.id)) { db.entries.push(e); tenho.add(e.id); novos++; }
      }
      let novasContas = 0;
      for (const [k, lista] of Object.entries(limparContas(d.bills))) {
        const atual = db.bills[k] || (db.bills[k] = []);
        const ids = new Set(atual.map(c => c.id));
        for (const c of lista) if (!ids.has(c.id)) { atual.push(c); ids.add(c.id); novasContas++; }
      }
      if (d.settings) {
        if (!db.settings.name && d.settings.name) db.settings.name = String(d.settings.name).slice(0, 40);
        if (!db.settings.goal && d.settings.goal) db.settings.goal = clampInt(d.settings.goal, 0, 99999999999);
      }
      salvar();
      render();
      const partes = [];
      if (novos) partes.push(`${novos} ${novos === 1 ? 'ganho' : 'ganhos'}`);
      if (novasContas) partes.push(`${novasContas} ${novasContas === 1 ? 'conta' : 'contas'}`);
      toast(partes.length ? `Restaurado: ${partes.join(' e ')}` : 'Nada novo: esses registros já estavam aqui');
    } catch (e) {
      toast('Esse arquivo não parece ser um backup do Meus Ganhos.');
    }
  }

  function exportarCsv() {
    if (!db.entries.length) return toast('Ainda não há registros para exportar.');
    const seguro = t => (/^[=+\-@\t\r]/.test(t) ? "'" + t : t);   // evita fórmulas na planilha
    const linhas = [['Data', 'Valor (R$)', 'Horas', 'Observação']];
    const ord = db.entries.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.at - b.at));
    for (const e of ord) {
      const [y, m, d] = e.date.split('-');
      linhas.push([`${d}/${m}/${y}`, nf2.format(e.cents / 100).replace(/\./g, ''),
        e.minutes ? (e.minutes / 60).toFixed(2).replace('.', ',') : '', seguro(e.note)]);
    }
    const csv = '﻿' + linhas.map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    baixar(`meus-ganhos-${hoje()}.csv`, 'text/csv;charset=utf-8', csv);
    toast('Planilha baixada');
  }

  async function apagarTudo() {
    const ok = await perguntar({
      title: 'Apagar tudo?',
      text: 'Todos os registros e ajustes deste aparelho serão apagados. Se quiser guardar, faça um backup antes.',
      ok: 'Apagar tudo', danger: true,
    });
    if (!ok) return;
    db = vazio();
    try { localStorage.removeItem(KEY); } catch (e) { /* ok */ }
    state.draft = novoRascunho(); state.editing = null; state.hist = null;
    render();
    toast('Dados apagados');
  }

  /* ---------- campos ---------- */

  function mascaraDinheiro(inp, comPrefixo) {
    const digitos = inp.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 9);
    const c = digitos ? parseInt(digitos, 10) : 0;
    inp.value = c ? (comPrefixo ? 'R$ ' : '') + nf2.format(c / 100) : '';
    return c;
  }

  function sincronizarChips() {
    const d = state.draft;
    const dm = (parseInt(d.h, 10) || 0) * 60 + (parseInt(d.m, 10) || 0);
    $$('[data-act="hours"]').forEach(b => b.setAttribute('aria-pressed', String(dm === Number(b.dataset.v) * 60)));
  }

  view.addEventListener('input', e => {
    const t = e.target, d = state.draft;
    switch (t.id) {
      case 'f-amount': d.cents = mascaraDinheiro(t, false); { const er = $('#f-err'); if (er) er.textContent = ''; } break;
      case 'f-h': t.value = t.value.replace(/\D/g, '').slice(0, 2); d.h = t.value; sincronizarChips(); break;
      case 'f-m': t.value = t.value.replace(/\D/g, '').slice(0, 2); d.m = t.value; sincronizarChips(); break;
      case 'f-note': d.note = t.value; break;
      case 's-goal': db.settings.goal = mascaraDinheiro(t, true); break;
      case 'c-amount': state.cform.cents = mascaraDinheiro(t, false); { const er = $('#c-err'); if (er) er.textContent = ''; } break;
      case 'c-name': state.cform.name = t.value; break;
      case 'c-day': t.value = t.value.replace(/\D/g, '').slice(0, 2); state.cform.day = t.value; break;
      default: break;
    }
  });

  view.addEventListener('change', e => {
    const t = e.target;
    switch (t.id) {
      case 'f-date': {
        const v = t.value && t.value <= hoje() ? t.value : hoje();
        state.draft.date = v; render(); break;
      }
      case 'h-month': state.hist = t.value; state.histLimit = 60; render(); break;
      case 's-name': db.settings.name = t.value.trim().slice(0, 40); if (salvar()) toast('Nome salvo'); break;
      case 's-goal': if (salvar()) toast(db.settings.goal ? 'Meta salva' : 'Meta removida'); break;
      case 'f-restore': if (t.files && t.files[0]) restaurar(t.files[0]); t.value = ''; break;
      default: break;
    }
  });

  view.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const d = state.draft;
    switch (b.dataset.act) {
      case 'date': d.date = b.dataset.v; render(); break;
      case 'hours': {
        const dm = (parseInt(d.h, 10) || 0) * 60 + (parseInt(d.m, 10) || 0);
        if (dm === Number(b.dataset.v) * 60) { d.h = ''; d.m = ''; } else { d.h = b.dataset.v; d.m = ''; }
        render(); break;
      }
      case 'save': salvarRegistro(); break;
      case 'cancel': state.editing = null; state.draft = novoRascunho(d.date); render(); break;
      case 'edit': iniciarEdicao(b.dataset.id); break;
      case 'del': apagarRegistro(b.dataset.id); break;
      case 'prev': state.month = somaMeses(state.month, -1); render(); break;
      case 'next': if (state.month < mesAtual()) { state.month = somaMeses(state.month, 1); render(); } break;
      case 'range': state.range = Number(b.dataset.v); render(); break;
      case 'glance': state.month = mesAtual(); location.hash = '#mes'; break;
      case 'gotoreg': location.hash = '#registrar'; break;
      case 'more': state.histLimit += 60; render(); break;
      case 'gobackup': location.hash = '#ajustes'; break;
      case 'snooze': db.snooze = Date.now() + 7 * 864e5; salvar(); render(); break;
      case 'backup': fazerBackup(false); break;
      case 'share': fazerBackup(true); break;
      case 'restore': $('#f-restore').click(); break;
      case 'csv': exportarCsv(); break;
      case 'wipe': apagarTudo(); break;
      case 'install': instalar(); break;
      case 'install-later': dispensarInstalacao(); atualizarInstalacao(); break;
      case 'install-help': state.abrirInstalar = true; location.hash = '#ajustes'; break;
      case 'cprev': state.cmonth = somaMeses(state.cmonth, -1); state.cform = null; render(); break;
      case 'cnext':
        if (state.cmonth < mesAtual()) { state.cmonth = somaMeses(state.cmonth, 1); state.cform = null; render(); }
        break;
      case 'cnew': state.cform = novoFormConta(); render(); window.scrollTo(0, 0); break;
      case 'cedit': editarConta(b.dataset.id); break;
      case 'cpaid': alternarPaga(b.dataset.id); break;
      case 'cname': state.cform.name = b.dataset.v; render(); focar('#c-amount'); break;
      case 'crepeat': state.cform.repeat = b.dataset.v === '1'; render(); focar(`[data-act="crepeat"][data-v="${b.dataset.v}"]`); break;
      case 'csave': salvarConta(); break;
      case 'ccancel': state.cform = null; render(); break;
      case 'cdel': apagarConta(state.cform && state.cform.id); break;
      default: break;
    }
  });

  /* ---------- gráficos (SVG feito à mão) ---------- */

  const COR = { verde: '#26805A', rosa: '#E0719B' };

  function escala(maxVal) {
    if (maxVal <= 0) return { max: 3, step: 1 };
    const bruto = maxVal / 3, mag = Math.pow(10, Math.floor(Math.log10(bruto))), n = bruto / mag;
    const passo = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
    return { max: passo * 3, step: passo };
  }
  // um único estilo por eixo: compacto (5 mil, 10 mil) se o eixo passa de 10 mil, senão por extenso
  const rotulosDe = ticks => {
    const compacto = Math.max(...ticks) >= 10000;
    return ticks.map(v => (compacto && v ? nfc.format(v) : nf0.format(v)));
  };
  const margemEsq = rotulos => Math.max(...rotulos.map(s => s.length)) * 6.6 + 14;
  const larguraDe = el => Math.max(260, Math.floor(el.clientWidth) || 320);

  function grade(f, ticks, yMax, rotulos) {
    return ticks.map((v, i) => {
      const y = f.b - (v / yMax) * (f.b - f.t);
      return `<line class="grid" x1="${f.l}" x2="${f.r}" y1="${y}" y2="${y}"/>` +
        `<text class="ax" x="${f.l - 8}" y="${y + 4}" text-anchor="end">${rotulos[i]}</text>`;
    }).join('');
  }

  function caminhoBarra(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h));
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  function eixoDias(f, slot, nDias) {
    return [1, 5, 10, 15, 20, 25, 30].filter(d => d <= nDias)
      .map(d => `<text class="ax" x="${f.l + slot * (d - 0.5)}" y="${f.b + 17}" text-anchor="middle">${d}</text>`).join('');
  }

  /* dica (tooltip) que acompanha o dedo ou o mouse */
  function ligarDicas(el, modelo) {
    const sv = $('svg', el);
    if (!sv || !modelo.dicas.length) return;
    const tip = document.createElement('div');
    tip.className = 'tip';
    el.appendChild(tip);
    let atual = -1;

    const mostrar = i => {
      if (i === atual) return;
      atual = i;
      $$('[data-i]', sv).forEach(n => n.classList.toggle('on', Number(n.dataset.i) === i));
      const dica = modelo.dicas[i];
      tip.innerHTML = dica.html;
      tip.classList.add('show');
      const w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = Math.max(0, Math.min(modelo.W - w, dica.x - w / 2)) + 'px';
      tip.style.top = Math.max(0, dica.y - h - 10) + 'px';
    };
    const esconder = () => {
      atual = -1;
      tip.classList.remove('show');
      $$('[data-i]', sv).forEach(n => n.classList.remove('on'));
    };
    const escolher = ev => {
      const r = sv.getBoundingClientRect();
      const x = (ev.clientX - r.left) * (modelo.W / r.width);
      let melhor = 0, dist = Infinity;
      modelo.centros.forEach((c, i) => { const dd = Math.abs(c - x); if (dd < dist) { dist = dd; melhor = i; } });
      mostrar(melhor);
    };
    sv.addEventListener('pointerdown', escolher);
    sv.addEventListener('pointermove', ev => { if (ev.pointerType === 'mouse' || ev.pressure > 0) escolher(ev); });
    sv.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') esconder(); });
    document.addEventListener('pointerdown', ev => { if (!el.contains(ev.target)) esconder(); });
  }

  function graficoDiario(el) {
    const key = state.month, nDias = diasNoMes(key), por = porDia(doMes(key));
    const W = larguraDe(el), H = 210;
    const vals = [];
    for (let d = 1; d <= nDias; d++) vals.push((por.get(`${key}-${pad(d)}`)?.cents || 0) / 100);
    const maxV = Math.max(...vals);
    const { max: yMax, step } = escala(maxV);
    const ticks = [0, step, step * 2, step * 3], rot = rotulosDe(ticks);
    const f = { l: margemEsq(rot), r: W - 4, t: 20, b: H - 26 };
    const slot = (f.r - f.l) / nDias, bw = Math.min(24, Math.max(3, slot - 2));
    const y = v => f.b - (v / yMax) * (f.b - f.t);

    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Gráfico de barras com os ganhos de cada dia de ${nomeMes(key)}. Os valores estão na tabela abaixo.">`;
    s += grade(f, ticks, yMax, rot) + eixoDias(f, slot, nDias);
    const centros = [], dicas = [];
    const iMax = vals.indexOf(maxV);
    vals.forEach((v, i) => {
      const cx = f.l + slot * (i + 0.5), ds = `${key}-${pad(i + 1)}`, r = por.get(ds);
      centros.push(cx);
      if (v > 0) {
        const h = (v / yMax) * (f.b - f.t);
        s += `<path class="bar" data-i="${i}" d="${caminhoBarra(cx - bw / 2, y(v), bw, h, 4)}"/>`;
      }
      dicas.push({
        x: cx, y: v > 0 ? y(v) : f.b - 6,
        html: `<strong>${rotuloDia(ds)}</strong>${r ? dinheiro(r.cents) + (r.minutes ? ` em ${horas(r.minutes)}` : '') : 'sem registro'}`,
      });
    });
    if (maxV > 0) {
      const cx = Math.min(f.r - 12, Math.max(f.l + 12, f.l + slot * (iMax + 0.5)));
      s += `<text class="val" x="${cx}" y="${y(maxV) - 6}" text-anchor="middle">${nf0.format(maxV)}</text>`;
    }
    el.innerHTML = s + '</svg>';
    ligarDicas(el, { W, centros, dicas });
  }

  function graficoAcumulado(el) {
    const key = state.month, nDias = diasNoMes(key), por = porDia(doMes(key));
    const ehAtual = key === mesAtual();
    const ultimo = ehAtual ? new Date().getDate() : nDias;
    const meta = db.settings.goal / 100;
    const W = larguraDe(el), H = 210;
    const acum = [];
    let soma = 0;
    for (let d = 1; d <= ultimo; d++) { soma += (por.get(`${key}-${pad(d)}`)?.cents || 0) / 100; acum.push(soma); }
    const { max: yMax, step } = escala(Math.max(soma, meta || 0));
    const ticks = [0, step, step * 2, step * 3], rot = rotulosDe(ticks);
    const f = { l: margemEsq(rot), r: W - 4, t: 20, b: H - 26 };
    const slot = (f.r - f.l) / nDias;
    const X = i => f.l + slot * (i + 0.5), Y = v => f.b - (v / yMax) * (f.b - f.t);

    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Gráfico de linha com o total acumulado em ${nomeMes(key)}: ${dinheiro(Math.round(soma * 100))}.">`;
    s += grade(f, ticks, yMax, rot) + eixoDias(f, slot, nDias);
    if (meta > 0 && meta <= yMax) {
      s += `<line class="goalline" x1="${f.l}" x2="${f.r}" y1="${Y(meta)}" y2="${Y(meta)}"/>` +
        `<text class="ax" x="${f.l + 4}" y="${Y(meta) - 5}">Meta</text>`;
    }
    const pts = acum.map((v, i) => `${X(i)},${Y(v)}`);
    s += `<path class="wash" d="M${X(0)},${f.b}L${pts.join('L')}L${X(acum.length - 1)},${f.b}Z"/>`;
    s += `<polyline class="line" points="${pts.join(' ')}"/>`;
    const centros = [], dicas = [];
    acum.forEach((v, i) => {
      const ds = `${key}-${pad(i + 1)}`;
      s += `<line class="xh" data-i="${i}" x1="${X(i)}" x2="${X(i)}" y1="${f.t}" y2="${f.b}"/>` +
        `<circle class="hd" data-i="${i}" cx="${X(i)}" cy="${Y(v)}" r="5"/>`;
      centros.push(X(i));
      dicas.push({ x: X(i), y: Y(v), html: `<strong>${rotuloDia(ds)}</strong>Acumulado: ${dinheiro(Math.round(v * 100))}` });
    });
    const ex = X(acum.length - 1), ey = Y(soma);
    s += `<circle class="ring" cx="${ex}" cy="${ey}" r="7"/><circle class="dot" cx="${ex}" cy="${ey}" r="5"/>`;
    s += `<text class="val" x="${Math.min(f.r, ex)}" y="${Math.max(12, ey - 12)}" text-anchor="end">${dinheiroInt(Math.round(soma * 100))}</text>`;
    el.innerHTML = s + '</svg>';
    ligarDicas(el, { W, centros, dicas });
  }

  function graficoMeses(el) {
    const meses = mesesEvolucao(), cur = mesAtual(), n = meses.length;
    const W = larguraDe(el), H = 220;
    const vals = meses.map(m => m.cents / 100), maxV = Math.max(...vals);
    const { max: yMax, step } = escala(maxV);
    const ticks = [0, step, step * 2, step * 3], rot = rotulosDe(ticks);
    const f = { l: margemEsq(rot), r: W - 4, t: 22, b: H - 26 };
    const slot = (f.r - f.l) / n, bw = Math.min(24, Math.max(6, slot - 6));
    const y = v => f.b - (v / yMax) * (f.b - f.t);
    const iMelhor = vals.indexOf(maxV), iAtual = meses.findIndex(m => m.key === cur);

    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Gráfico de barras com os ganhos de cada mês. Os valores estão na tabela Mês a mês.">`;
    s += grade(f, ticks, yMax, rot);
    const centros = [], dicas = [];
    meses.forEach((m, i) => {
      const cx = f.l + slot * (i + 0.5), v = vals[i];
      centros.push(cx);
      s += `<text class="ax${n > 8 ? ' sm' : ''}" x="${cx}" y="${f.b + 17}" text-anchor="middle">${mes3(m.key)}</text>`;
      if (v > 0) {
        const h = (v / yMax) * (f.b - f.t);
        s += `<path class="bar${m.key === cur ? '' : ' pk'}" data-i="${i}" d="${caminhoBarra(cx - bw / 2, y(v), bw, h, 4)}"/>`;
      }
      dicas.push({
        x: cx, y: v > 0 ? y(v) : f.b - 6,
        html: `<strong>${nomeMes(m.key)} de ${m.key.slice(0, 4)}</strong>${dinheiro(m.cents)}${m.minutes ? `<br>${horas(m.minutes)} trabalhadas` : ''}`,
      });
    });
    const rotular = i => {
      if (vals[i] <= 0) return;
      const cx = Math.min(f.r - 14, Math.max(f.l + 14, f.l + slot * (i + 0.5)));
      s += `<text class="val" x="${cx}" y="${y(vals[i]) - 6}" text-anchor="middle">${nfc.format(vals[i])}</text>`;
    };
    rotular(iAtual);
    if (iMelhor !== iAtual && Math.abs(iMelhor - iAtual) > 1) rotular(iMelhor);
    el.innerHTML = s + '</svg>';
    ligarDicas(el, { W, centros, dicas });
  }

  function graficoHora(el) {
    const meses = mesesEvolucao(), n = meses.length;
    const W = larguraDe(el), H = 200;
    const vals = meses.map(m => m.porHora / 100), maxV = Math.max(...vals);
    const { max: yMax, step } = escala(maxV);
    const ticks = [0, step, step * 2, step * 3], rot = rotulosDe(ticks);
    const f = { l: margemEsq(rot), r: W - 10, t: 22, b: H - 26 };
    const slot = (f.r - f.l) / n;
    const X = i => f.l + slot * (i + 0.5), Y = v => f.b - (v / yMax) * (f.b - f.t);
    const idx = vals.map((v, i) => (v > 0 ? i : -1)).filter(i => i >= 0);

    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Gráfico de linha com o ganho médio por hora em cada mês. Os valores estão na tabela Mês a mês.">`;
    s += grade(f, ticks, yMax, rot);
    meses.forEach((m, i) => { s += `<text class="ax${n > 8 ? ' sm' : ''}" x="${X(i)}" y="${f.b + 17}" text-anchor="middle">${mes3(m.key)}</text>`; });
    s += `<polyline class="line" points="${idx.map(i => `${X(i)},${Y(vals[i])}`).join(' ')}"/>`;
    const centros = [], dicas = [];
    idx.forEach(i => {
      s += `<circle class="hd" data-i="${centros.length}" cx="${X(i)}" cy="${Y(vals[i])}" r="5"/>` +
        `<circle class="ring" cx="${X(i)}" cy="${Y(vals[i])}" r="6.5"/><circle class="dot" cx="${X(i)}" cy="${Y(vals[i])}" r="4.5"/>`;
      centros.push(X(i));
      dicas.push({ x: X(i), y: Y(vals[i]), html: `<strong>${nomeMes(meses[i].key)}</strong>${dinheiro(meses[i].porHora)} por hora` });
    });
    const ult = idx[idx.length - 1];
    s += `<text class="val" x="${Math.min(f.r, X(ult))}" y="${Math.max(12, Y(vals[ult]) - 12)}" text-anchor="end">${dinheiro(meses[ult].porHora)}/h</text>`;
    el.innerHTML = s + '</svg>';
    ligarDicas(el, { W, centros, dicas });
  }

  function graficoSemana(el) {
    const acc = Array.from({ length: 7 }, () => ({ cents: 0, dias: new Set() }));
    for (const e of db.entries) { const w = parse(e.date).getDay(); acc[w].cents += e.cents; acc[w].dias.add(e.date); }
    const ordem = [1, 2, 3, 4, 5, 6, 0];
    const med = ordem.map(i => (acc[i].dias.size ? acc[i].cents / acc[i].dias.size : 0));
    const maxV = Math.max(...med, 1);
    const W = larguraDe(el), linha = 30, H = linha * 7 + 4;
    const esq = 38, dir = 78, largMax = W - esq - dir;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Gráfico de barras com a média de ganho por dia da semana.">`;
    ordem.forEach((wd, i) => {
      const yy = i * linha + 2, w = (med[i] / maxV) * largMax;
      s += `<text class="ax" x="${esq - 8}" y="${yy + linha / 2 + 4}" text-anchor="end">${DIA3[wd]}</text>`;
      if (med[i] > 0) {
        const r = Math.min(4, w);
        s += `<path class="bar" d="M${esq},${yy + 6}H${esq + w - r}Q${esq + w},${yy + 6} ${esq + w},${yy + 6 + r}V${yy + linha - 6 - r}Q${esq + w},${yy + linha - 6} ${esq + w - r},${yy + linha - 6}H${esq}Z"/>`;
        s += `<text class="val" x="${esq + w + 8}" y="${yy + linha / 2 + 4}">${dinheiroInt(med[i])}</text>`;
      } else {
        s += `<text class="ax" x="${esq + 4}" y="${yy + linha / 2 + 4}">sem registros</text>`;
      }
    });
    el.innerHTML = s + '</svg>';
  }

  const GRAFICOS = { daily: graficoDiario, cumul: graficoAcumulado, months: graficoMeses, rate: graficoHora, weekday: graficoSemana };

  function desenharGraficos() {
    $$('.chart', view).forEach(el => { const fn = GRAFICOS[el.dataset.chart]; if (fn) fn(el); });
  }

  let larguraAnterior = 0, tRedim;
  window.addEventListener('resize', () => {
    clearTimeout(tRedim);
    tRedim = setTimeout(() => {
      const w = view.clientWidth;
      if (w !== larguraAnterior) { larguraAnterior = w; desenharGraficos(); }
    }, 150);
  });

  /* ---------- início ---------- */

  $$('.tab').forEach(a => { a.innerHTML = `${ICON[a.dataset.v]}<span>${TABS[a.dataset.v]}</span>`; });
  window.addEventListener('hashchange', rota);
  rota();
  larguraAnterior = view.clientWidth;

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => { /* sem offline, tudo bem */ }); });
  }
})();
