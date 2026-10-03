/* =====================================================================
   PORTFÓLIO — Cauã de Oliveira Hoffmann
   ===================================================================== */
(function () {
  "use strict";

  /* -------------------------------------------------------------------
     CONFIG — as únicas coisas que você deve precisar mexer neste arquivo
     ------------------------------------------------------------------- */
  var CONFIG = {
    // 1) VÍDEO: cole entre as aspas o link do seu vídeo no YouTube.
    //    Exemplo: videoUrl: "https://youtu.be/XXXXXXXXXXX",
    //    Enquanto estiver vazio, o site mostra o aviso "em breve".
    //    (O vídeo só toca no site publicado; abrindo o arquivo no computador o YouTube bloqueia.)
    videoUrl: "",

    // 2) FORMULÁRIO: endereço do FormSubmit (gratuito), que entrega as mensagens no seu e-mail.
    //    Depois de ativar, dá para trocar o e-mail pelo código que eles enviam (assim o e-mail
    //    não aparece aqui). Se deixar vazio (""), o botão abre o aplicativo de e-mail do visitante.
    formEndpoint: "https://formsubmit.co/ajax/cauaohoffmann@gmail.com",

    // 3) Seu e-mail (usado como plano B se o envio do formulário falhar).
    email: "cauaohoffmann@gmail.com",

    // 4) Idioma em que o site abre: "en", "pt" ou "fr".
    defaultLang: "en",

    // 5) Arquivo do currículo para cada idioma (botão "Download my CV" do topo).
    cv: {
      en: { file: "assets/cv/CV_CH_En.pdf", saveAs: "CV_Caua_Hoffmann_EN.pdf" },
      pt: { file: "assets/cv/CV_CH_Pt.pdf", saveAs: "CV_Caua_Hoffmann_PT.pdf" },
      fr: { file: "assets/cv/CV_CH_Fr.pdf", saveAs: "CV_Caua_Hoffmann_FR.pdf" }
    }
  };

  /* ------------------------------------------------------------------- */

  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // O navegador pode bloquear o armazenamento (aba anônima, por exemplo): nesse caso o site só não "lembra" a escolha.
  var store = {
    get: function (key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* sem armazenamento */ } }
  };

  /* =============================== IDIOMAS ===============================
     O inglês é lido do próprio index.html; português e francês vêm do translations.js. */
  var LANGS = ["en", "pt", "fr"];
  var HTML_LANG = { en: "en", pt: "pt-BR", fr: "fr" };
  var dict = { en: {}, pt: (window.I18N && window.I18N.pt) || {}, fr: (window.I18N && window.I18N.fr) || {} };
  var lang = "en";

  // Francês: troca o espaço antes de : ; ? ! (e o dos milhares) por um espaço que não quebra linha
  Object.keys(dict.fr).forEach(function (key) {
    dict.fr[key] = String(dict.fr[key])
      .replace(/ ([:;?!»])/g, "\u00A0$1")
      .replace(/« /g, "«\u00A0")
      .replace(/(\d) (\d{3})(?!\d)/g, "$1\u00A0$2");
  });

  var textNodes = $$("[data-i18n]");
  var attrNodes = $$("[data-i18n-attr]").map(function (el) {
    var pairs = el.getAttribute("data-i18n-attr").split(";").map(function (pair) {
      var i = pair.indexOf(":");
      return i < 0 ? null : [pair.slice(0, i).trim(), pair.slice(i + 1).trim()];
    }).filter(Boolean);
    return { el: el, pairs: pairs };
  });

  textNodes.forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (!(key in dict.en)) dict.en[key] = el.textContent.replace(/\s+/g, " ").trim();
  });
  attrNodes.forEach(function (node) {
    node.pairs.forEach(function (pair) {
      if (!(pair[1] in dict.en)) dict.en[pair[1]] = node.el.getAttribute(pair[0]) || "";
    });
  });

  function t(key) {
    var current = dict[lang] || {};
    if (key in current) return current[key];
    return key in dict.en ? dict.en[key] : key;
  }

  var langButtons = $$(".lang__btn");
  var cvBtn = $("#cvBtn");
  var onLangChange = [];   // funções que precisam refazer algum texto quando o idioma muda

  function applyLang(next, remember) {
    lang = LANGS.indexOf(next) >= 0 ? next : CONFIG.defaultLang;
    root.lang = HTML_LANG[lang];

    textNodes.forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    attrNodes.forEach(function (node) {
      node.pairs.forEach(function (pair) { node.el.setAttribute(pair[0], t(pair[1])); });
    });
    langButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
    });

    if (cvBtn) {
      var cv = CONFIG.cv[lang] || CONFIG.cv.en;
      cvBtn.setAttribute("href", cv.file);
      cvBtn.setAttribute("download", cv.saveAs);
    }
    onLangChange.forEach(function (fn) { fn(); });

    if (remember) {
      store.set("lang", lang);
      try {   // deixa o idioma no endereço (ex.: ...github.io/?lang=fr) para o link poder ser compartilhado já em francês
        var url = new URL(window.location.href);
        if (lang === CONFIG.defaultLang) url.searchParams.delete("lang"); else url.searchParams.set("lang", lang);
        window.history.replaceState(null, "", url.toString());
      } catch (e) { /* endereço não pôde ser atualizado; sem problema */ }
    }
  }

  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { applyLang(btn.getAttribute("data-lang"), true); });
  });

  /* ================================ TEMA ================================ */
  var themeBtn = $("#themeBtn");
  var metaTheme = $('meta[name="theme-color"]');

  function labelTheme() {
    if (!themeBtn) return;
    var label = t(root.getAttribute("data-theme") === "dark" ? "theme.toLight" : "theme.toDark");
    themeBtn.setAttribute("aria-label", label);
    themeBtn.setAttribute("title", label);
  }
  function setTheme(theme, remember) {
    root.setAttribute("data-theme", theme);
    if (metaTheme) metaTheme.setAttribute("content", theme === "dark" ? "#0A1821" : "#F3F6F8");
    labelTheme();
    if (remember) store.set("theme", theme);
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }
  onLangChange.push(labelTheme);

  /* ================================ MENU ================================ */
  var topbar = $("#topbar");
  var nav = $("#nav");
  var menuBtn = $("#menuBtn");
  var navLinks = $$(".nav a");
  var sections = navLinks.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);

  function closeMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    navLinks.forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { closeMenu(); menuBtn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !topbar.contains(e.target)) closeMenu();
    });
  }

  // Troca para o botão "Menu" sempre que os links não cabem na barra (depende da largura da tela e do idioma)
  var barInner = $(".topbar__in");
  var barTools = $(".tools");
  function navFits() {
    // os botões da direita não podem passar da margem do conteúdo
    var padding = parseFloat(window.getComputedStyle(barInner).paddingRight) || 0;
    return barTools.getBoundingClientRect().right <= barInner.getBoundingClientRect().right - padding + 0.5;
  }
  function fitNav() {
    if (!barInner || !barTools) return;
    root.classList.remove("nav-compact");
    // tenta espaçamentos cada vez menores entre os links e, por último, uma letra um pouco menor
    var tries = [[22, false], [18, false], [15, false], [12, false], [14, true], [12, true], [10, true]];
    for (var i = 0; i < tries.length; i++) {
      root.style.setProperty("--nav-gap", tries[i][0] + "px");
      root.classList.toggle("nav-tight", tries[i][1]);
      if (navFits()) { closeMenu(); return; }
    }
    root.style.removeProperty("--nav-gap");
    root.classList.remove("nav-tight");
    root.classList.add("nav-compact");
  }
  onLangChange.push(fitNav);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);

  // Marca no menu a seção que está na tela
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    if (topbar) topbar.classList.toggle("is-stuck", y > 8);

    var line = y + (topbar ? topbar.offsetHeight : 0) + window.innerHeight * 0.28;
    var current = null;
    sections.forEach(function (sec) { if (sec.offsetTop <= line) current = sec; });
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4 && sections.length) {
      current = sections[sections.length - 1];
    }
    navLinks.forEach(function (a) {
      if (current && a.getAttribute("href") === "#" + current.id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  var resizing = false;
  window.addEventListener("resize", function () {
    if (resizing) return;
    resizing = true;
    window.requestAnimationFrame(function () { resizing = false; fitNav(); onScroll(); });
  });

  /* ====================== ESTATOR: acelera ao passar o mouse ====================== */
  var stage = $(".machine__stage");
  if (stage && stage.getAnimations && !reducedMotion) {
    var rate = 1, target = 1, frame = 0;
    var fieldAnimations = function () {
      return stage.getAnimations({ subtree: true }).filter(function (a) {
        return a.animationName === "m-spin" || a.animationName === "m-current";
      });
    };
    var step = function () {
      rate += (target - rate) * 0.07;
      if (Math.abs(target - rate) < 0.02) rate = target;
      fieldAnimations().forEach(function (a) { a.playbackRate = rate; });
      frame = rate === target ? 0 : window.requestAnimationFrame(step);
    };
    var spin = function (to) { target = to; if (!frame) frame = window.requestAnimationFrame(step); };
    stage.addEventListener("pointerenter", function () { spin(6); });
    stage.addEventListener("pointerleave", function () { spin(1); });
    stage.addEventListener("pointercancel", function () { spin(1); });
  }

  /* =================== TRAJETO: desenha quando aparece na tela =================== */
  var route = $("#route");
  if (route) {
    if ("IntersectionObserver" in window && !reducedMotion) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { route.classList.add("is-in"); seen.disconnect(); }
        });
      }, { threshold: 0.35 });
      seen.observe(route);
    } else {
      route.classList.add("is-in");
    }
  }

  /* ========================== FOTOS: ampliar ao clicar ========================== */
  var lightbox = $("#lightbox");
  var lbImg = $("#lbImg");
  var lbCap = $("#lbCap");
  var shots = $$(".shot__link");
  var shotIndex = -1;

  function showShot(i) {
    shotIndex = (i + shots.length) % shots.length;
    var link = shots[shotIndex];
    var thumb = $("img", link);
    var caption = $("figcaption", link.parentNode);
    lbImg.setAttribute("src", link.getAttribute("href"));
    lbImg.setAttribute("alt", thumb ? thumb.getAttribute("alt") : "");
    lbCap.textContent = caption ? caption.textContent : "";
  }
  if (lightbox && typeof lightbox.showModal === "function" && shots.length) {
    shots.forEach(function (link, i) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        showShot(i);
        lightbox.showModal();
      });
    });
    $("#lbClose").addEventListener("click", function () { lightbox.close(); });
    $("#lbPrev").addEventListener("click", function () { showShot(shotIndex - 1); });
    $("#lbNext").addEventListener("click", function () { showShot(shotIndex + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") showShot(shotIndex - 1);
      if (e.key === "ArrowRight") showShot(shotIndex + 1);
    });
    lightbox.addEventListener("close", function () { lbImg.removeAttribute("src"); });
  }
  onLangChange.push(function () {
    shots.forEach(function (link) { link.setAttribute("title", t("shot.enlarge")); });
    if (lightbox && lightbox.open && shotIndex >= 0) showShot(shotIndex);
  });

  // As fotos fora da tela só são baixadas quando necessário; depois que a página carrega, baixa o resto
  // em segundo plano (assim a ampliação abre na hora e nada falta ao imprimir ou salvar em PDF).
  function loadAllPhotos() {
    $$('img[loading="lazy"]').forEach(function (img) { img.loading = "eager"; });
  }
  window.addEventListener("load", function () {
    if ("requestIdleCallback" in window) window.requestIdleCallback(loadAllPhotos, { timeout: 4000 });
    else window.setTimeout(loadAllPhotos, 2500);
  });
  window.addEventListener("beforeprint", loadAllPhotos);

  /* ================================ VÍDEO ================================ */
  function youtubeId(url) {
    var value = String(url || "").trim();
    var match = value.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
    return /^[A-Za-z0-9_-]{11}$/.test(value) ? value : null;
  }
  var videoBox = $("#video");
  var videoNote = $("#videoNote");
  var videoId = youtubeId(CONFIG.videoUrl);
  if (videoBox && videoId) {
    var playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "video__play";
    playBtn.innerHTML =
      '<img src="https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg" alt="" loading="lazy">' +
      '<span class="video__knob"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg></span>';
    playBtn.addEventListener("click", function () {
      // O YouTube só é carregado aqui, depois do clique (página mais leve e sem cookies antes disso)
      var player = document.createElement("iframe");
      player.src = "https://www.youtube-nocookie.com/embed/" + videoId + "?autoplay=1&rel=0";
      player.title = t("pitch.frame");
      player.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      player.referrerPolicy = "strict-origin-when-cross-origin";
      player.allowFullscreen = true;
      videoBox.innerHTML = "";
      videoBox.appendChild(player);
    });
    videoBox.innerHTML = "";
    videoBox.appendChild(playBtn);
    if (videoNote) videoNote.hidden = false;
    onLangChange.push(function () { playBtn.setAttribute("aria-label", t("pitch.play")); });
  }

  /* ============================== FORMULÁRIO ============================== */
  var form = $("#contactForm");
  var sendBtn = $("#sendBtn");
  var statusEl = $("#formStatus");
  var lastStatus = null;   // guarda a última mensagem para traduzi-la se o idioma mudar

  function renderStatus() {
    if (!statusEl) return;
    statusEl.textContent = "";
    statusEl.className = "form__status";
    if (!lastStatus) return;
    if (lastStatus.kind) statusEl.classList.add("is-" + lastStatus.kind);
    statusEl.appendChild(document.createTextNode(t(lastStatus.key)));
    if (lastStatus.mailto) {
      statusEl.appendChild(document.createElement("br"));
      var link = document.createElement("a");
      link.href = lastStatus.mailto;
      link.textContent = t("form.mailto");
      statusEl.appendChild(link);
    }
  }
  function setStatus(key, kind, mailto) {
    lastStatus = key ? { key: key, kind: kind || "", mailto: mailto || "" } : null;
    renderStatus();
  }
  onLangChange.push(renderStatus);

  function mailtoLink(data) {
    var body = data.message + "\n\n" + data.name + "\n" + data.email;
    return "mailto:" + CONFIG.email +
      "?subject=" + encodeURIComponent(t("form.subject")) +
      "&body=" + encodeURIComponent(body);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = form.elements;
      var nameField = fields.namedItem("name");
      var emailField = fields.namedItem("email");
      var messageField = fields.namedItem("message");
      var trap = fields.namedItem("_honey");
      var data = {
        name: nameField.value.trim(),
        email: emailField.value.trim(),
        message: messageField.value.trim()
      };

      if (trap && trap.value) return;   // campo-armadilha preenchido = robô

      var firstInvalid = !data.name ? nameField
        : (!data.email || !emailField.checkValidity()) ? emailField
        : !data.message ? messageField : null;
      if (firstInvalid) {
        setStatus("form.invalid", "error");
        firstInvalid.focus();
        return;
      }

      if (!CONFIG.formEndpoint) {   // sem serviço configurado: abre o aplicativo de e-mail
        window.location.href = mailtoLink(data);
        return;
      }

      sendBtn.disabled = true;
      setStatus("form.sending");

      window.fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          _subject: "Portfólio: nova mensagem de " + data.name,
          _template: "table",
          _captcha: "false"
        })
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (json) {
          var ok = response.ok && (json.success === true || json.success === "true");
          if (!ok) throw new Error(json.message || ("HTTP " + response.status));
        });
      }).then(function () {
        form.reset();
        setStatus("form.sent", "ok");
      }).catch(function (error) {
        if (window.console) console.warn("[formulário de contato]", error);
        // Primeiro envio de todos: o FormSubmit pede uma ativação por e-mail (só acontece uma vez)
        var needsActivation = /activat/i.test(String(error && error.message));
        setStatus(needsActivation ? "form.activate" : "form.error", "error", mailtoLink(data));
      }).then(function () {
        sendBtn.disabled = false;
      });
    });
  }

  /* ================================ INÍCIO ================================ */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var wanted = null;
  try { wanted = new URL(window.location.href).searchParams.get("lang"); } catch (e) { /* sem URL */ }
  if (LANGS.indexOf(wanted) < 0) wanted = store.get("lang");
  applyLang(LANGS.indexOf(wanted) >= 0 ? wanted : CONFIG.defaultLang, false);
  setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
  onScroll();
})();
