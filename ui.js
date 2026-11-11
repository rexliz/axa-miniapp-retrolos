/* ==========================================================================
   RetroLos! – gemeinsame Helfer für die Oberfläche
   Speicher (localStorage mit try/catch), Kopieren, Download, Statusmeldung,
   kleiner DOM-Baukasten. Wird vor den Seiten-Scripts geladen.
   ========================================================================== */
(function (root) {
  'use strict';

  const PREFIX = 'retrolos:';

  // Alle Zugriffe in try/catch: Im privaten Modus oder bei gesperrtem Speicher
  // funktioniert die App weiter, sie merkt sich dann nur nichts.
  const storage = {
    get(key, fallback) {
      try {
        const raw = root.localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        root.localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    remove(key) {
      try {
        root.localStorage.removeItem(PREFIX + key);
      } catch (e) {
        /* ohne Speicher nichts zu tun */
      }
    },
    clearAll() {
      try {
        Object.keys(root.localStorage)
          .filter((k) => k.startsWith(PREFIX))
          .forEach((k) => root.localStorage.removeItem(k));
        return true;
      } catch (e) {
        return false;
      }
    },
  };

  async function copyText(text) {
    try {
      if (root.navigator.clipboard && root.isSecureContext) {
        await root.navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      /* weiter mit dem Ausweichweg */
    }
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.className = 'clipboard-helper';
    document.body.append(helper);
    helper.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    helper.remove();
    return ok;
  }

  function download(filename, text, type) {
    const blob = new Blob([text], { type: type || 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.className = 'clipboard-helper';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  let statusTimer = null;
  function announce(message, kind) {
    const box = document.getElementById('status');
    if (!box) return;
    box.textContent = message;
    box.dataset.kind = kind || 'info';
    box.classList.add('is-visible');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => box.classList.remove('is-visible'), 4500);
  }

  // el('p', { class: 'x', text: 'Hallo' }, kind1, kind2)
  // Kein «style»-Attribut: die CSP verbietet Inline-Styles.
  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'dataset') Object.assign(node.dataset, value);
      else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
      else if (value === true) node.setAttribute(key, '');
      else node.setAttribute(key, String(value));
    });
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      node.append(child instanceof Node ? child : String(child));
    });
    return node;
  }

  function motionOk() {
    return !(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Kopier-Knöpfe: data-copy-target="#id" kopiert den Wert/Text des Ziels.
  function wireCopyButtons(scope) {
    (scope || document).querySelectorAll('[data-copy-target]').forEach((button) => {
      button.addEventListener('click', async () => {
        const target = document.querySelector(button.dataset.copyTarget);
        if (!target) return;
        const text = 'value' in target ? target.value : target.textContent;
        const ok = await copyText(text);
        announce(ok ? (button.dataset.copyDone || 'Kopiert.') : 'Kopieren hat nicht geklappt – bitte Text markieren und mit Ctrl+C / Cmd+C kopieren.', ok ? 'success' : 'warning');
      });
    });
  }

  // Datenschutz-Wächter: zeigt unter einem Eingabefeld einen freundlichen,
  // nicht blockierenden Hinweis, wenn der Text nach Personendaten aussieht.
  function attachPrivacyHint(field) {
    const privacy = root.RetroLos && root.RetroLos.privacy;
    if (!privacy || !field) return { run() {} };
    const hint = el('p', { class: 'privacy-hint', hidden: true });
    if (field.id) {
      hint.id = field.id + '-datenschutz';
      field.setAttribute('aria-describedby', ((field.getAttribute('aria-describedby') || '') + ' ' + hint.id).trim());
    }
    (field.closest('form') || field).insertAdjacentElement('afterend', hint);
    let timer = null;
    const run = () => {
      const hits = privacy.check(field.value);
      hint.hidden = hits.length === 0;
      hint.textContent = hits.length ? '🛡️ ' + privacy.describe(hits) : '';
    };
    field.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(run, 250);
    });
    run();
    return { run, hint };
  }

  root.RetroLos = root.RetroLos || {};
  root.RetroLos.ui = { storage, copyText, download, announce, el, motionOk, wireCopyButtons, attachPrivacyHint };
})(globalThis);
