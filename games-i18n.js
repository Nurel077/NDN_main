(function () {
  const STORAGE = 'ndn_game_lang_v1';
  const allowed = ['ky', 'ru', 'en'];

  function getLang() {
    const saved = localStorage.getItem(STORAGE);
    return allowed.includes(saved) ? saved : 'ky';
  }

  function setLang(lang) {
    if (!allowed.includes(lang)) return;
    localStorage.setItem(STORAGE, lang);
  }

  function text(bundle, key, params) {
    const lang = getLang();
    const table = bundle[lang] || bundle.ky || {};
    let value = table[key] || key;
    if (params && typeof value === 'string') {
      Object.keys(params).forEach((k) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(params[k]));
      });
    }
    return value;
  }

  function mountLang(containerId, onChange) {
    const root = document.getElementById(containerId);
    if (!root) return;
    const current = getLang();
    root.innerHTML = '';

    [['ky', 'KG'], ['ru', 'RU'], ['en', 'EN']].forEach(([code, label]) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      if (code === current) btn.classList.add('active');
      btn.addEventListener('click', () => {
        setLang(code);
        if (typeof onChange === 'function') onChange(code);
        else location.reload();
      });
      root.appendChild(btn);
    });
  }

  window.NDN = { getLang, setLang, text, mountLang };
})();
