// Barra de acessibilidade usada em todas as páginas do site.
// Coloca a barra no topo, envolve o resto da página em #conteudo e lembra as escolhas no navegador.
(function () {
  var CHAVE = 'renata-a11y';
  var ZOOMS = [0.9, 1, 1.1, 1.25, 1.4, 1.6];
  var TIPOS = [
    ['', 'Daltonismo'],
    ['protanopia', 'Protanopia (não vê vermelho)'],
    ['protanomalia', 'Protanomalia (vermelho fraco)'],
    ['deuteranopia', 'Deuteranopia (não vê verde)'],
    ['deuteranomalia', 'Deuteranomalia (verde fraco)'],
    ['tritanopia', 'Tritanopia (não vê azul)'],
    ['tritanomalia', 'Tritanomalia (azul fraco)'],
    ['acromatopsia', 'Acromatopsia (sem cores)'],
    ['acromatomalia', 'Acromatomalia (cores fracas)'],
  ];
  // Matrizes de correção (daltonização): passam a diferença de cor que a pessoa não vê para cores que ela vê.
  var MATRIZES = {
    protanopia: '1 0 0 0 0 -0.255 1.255 0 0 0 0.303 -0.545 1.242 0 0 0 0 0 1 0',
    protanomalia: '1 0 0 0 0 -0.205 1.205 0 0 0 0.128 -0.253 1.125 0 0 0 0 0 1 0',
    deuteranopia: '1 0 0 0 0 -0.438 1.438 0 0 0 0.262 -0.562 1.3 0 0 0 0 0 1 0',
    deuteranomalia: '1 0 0 0 0 -0.118 1.118 0 0 0 0.14 -0.282 1.142 0 0 0 0 0 1 0',
    tritanopia: '1.05 -0.382 0.332 0 0 0 1.234 -0.234 0 0 0 0 1 0 0 0 0 0 1 0',
    tritanomalia: '1.033 -0.161 0.128 0 0 0 1.139 -0.139 0 0 0 0 1 0 0 0 0 0 1 0',
  };

  var raiz = document.documentElement;
  var estado = { dislexia: false, daltonismo: '', zoom: 1 };
  try { Object.assign(estado, JSON.parse(localStorage.getItem(CHAVE)) || {}); } catch (e) {}

  function aplicar() {
    raiz.classList.toggle('a11y-dislexia', !!estado.dislexia);
    if (estado.daltonismo) raiz.setAttribute('data-daltonismo', estado.daltonismo);
    else raiz.removeAttribute('data-daltonismo');
    raiz.style.setProperty('--a11y-zoom', estado.zoom);
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {}
  }
  aplicar();

  function montar() {
    // Envolve a página (menos scripts, modelos e botões fixos) para os ajustes não mexerem na barra.
    var conteudo = document.createElement('div');
    conteudo.id = 'conteudo';
    Array.prototype.slice.call(document.body.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && (n.tagName === 'SCRIPT' || n.tagName === 'TEMPLATE' || n.classList.contains('float-chat'))) return;
      conteudo.appendChild(n);
    });
    document.body.insertBefore(conteudo, document.body.firstChild);

    var svg = '<svg class="a11y-svg" aria-hidden="true" focusable="false"><defs>' +
      Object.keys(MATRIZES).map(function (k) {
        return '<filter id="a11y-' + k + '" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="' + MATRIZES[k] + '"/></filter>';
      }).join('') + '</defs></svg>';

    var barra = document.createElement('div');
    barra.className = 'a11y-bar';
    barra.setAttribute('role', 'region');
    barra.setAttribute('aria-label', 'Acessibilidade');
    barra.innerHTML = svg +
      '<div class="a11y-inner">' +
      '<span class="a11y-label">Acessibilidade</span>' +
      '<button type="button" id="a11y-dislexia" aria-pressed="false">Letra para dislexia</button>' +
      '<div class="a11y-menu" id="a11y-daltonismo">' +
      '<button type="button" class="a11y-menu-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="a11y-dalt-lista" aria-label="Filtro para daltonismo"></button>' +
      '<ul class="a11y-menu-lista" id="a11y-dalt-lista" role="listbox" aria-label="Filtro para daltonismo" tabindex="-1" hidden>' +
      TIPOS.map(function (t) { return '<li role="option" tabindex="-1" data-valor="' + t[0] + '">' + (t[0] ? t[1] : 'Sem filtro') + '</li>'; }).join('') +
      '</ul></div>' +
      '<span class="a11y-size" role="group" aria-label="Tamanho do texto">' +
      '<button type="button" id="a11y-menos" aria-label="Diminuir o texto">A−</button>' +
      '<output id="a11y-zoom" aria-live="polite"></output>' +
      '<button type="button" id="a11y-mais" aria-label="Aumentar o texto">A+</button>' +
      '</span></div>';
    document.body.insertBefore(barra, document.body.firstChild);

    var bDis = document.getElementById('a11y-dislexia');
    var menu = document.getElementById('a11y-daltonismo');
    var mBtn = menu.querySelector('.a11y-menu-btn');
    var lista = menu.querySelector('.a11y-menu-lista');
    var opcoes = Array.prototype.slice.call(lista.querySelectorAll('[role="option"]'));
    var out = document.getElementById('a11y-zoom');
    var menos = document.getElementById('a11y-menos');
    var mais = document.getElementById('a11y-mais');

    function atualizarBarra() {
      bDis.setAttribute('aria-pressed', estado.dislexia ? 'true' : 'false');
      var atual = estado.daltonismo || '';
      opcoes.forEach(function (o) { o.setAttribute('aria-selected', o.getAttribute('data-valor') === atual ? 'true' : 'false'); });
      var t = TIPOS.filter(function (x) { return x[0] === atual; })[0];
      mBtn.textContent = atual && t ? t[1].replace(/ \(.*\)$/, '') : 'Daltonismo';
      mBtn.classList.toggle('a11y-ativo', !!atual);
      var i = ZOOMS.indexOf(Number(estado.zoom));
      if (i < 0) { estado.zoom = 1; i = 1; }
      out.textContent = Math.round(estado.zoom * 100) + '%';
      menos.disabled = i === 0;
      mais.disabled = i === ZOOMS.length - 1;
    }
    function mudarZoom(passo) {
      var i = ZOOMS.indexOf(Number(estado.zoom));
      estado.zoom = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, (i < 0 ? 1 : i) + passo))];
      aplicar(); atualizarBarra();
    }

    bDis.addEventListener('click', function () { estado.dislexia = !estado.dislexia; aplicar(); atualizarBarra(); });

    // Menu de daltonismo: abre ao passar o mouse (ou ao tocar/clicar), fecha sozinho ao sair, funciona pelo teclado.
    var podePairar = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var timer;
    function aberto() { return !lista.hidden; }
    function abrir(focar) {
      clearTimeout(timer);
      lista.hidden = false; mBtn.setAttribute('aria-expanded', 'true');
      if (focar) (opcoes.filter(function (o) { return o.getAttribute('aria-selected') === 'true'; })[0] || opcoes[0]).focus();
    }
    function fechar(voltarFoco) {
      clearTimeout(timer);
      lista.hidden = true; mBtn.setAttribute('aria-expanded', 'false');
      if (voltarFoco) mBtn.focus();
    }
    function escolher(o) { estado.daltonismo = o.getAttribute('data-valor'); aplicar(); atualizarBarra(); fechar(true); }
    if (podePairar) {
      menu.addEventListener('mouseenter', function () { abrir(false); });
      menu.addEventListener('mouseleave', function () { timer = setTimeout(function () { fechar(false); }, 150); });
    }
    mBtn.addEventListener('click', function () { if (aberto() && !podePairar) fechar(false); else abrir(false); });
    mBtn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(true); }
      else if (e.key === 'Escape') fechar(false);
    });
    opcoes.forEach(function (o, i) {
      o.addEventListener('click', function () { escolher(o); });
      o.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); opcoes[Math.min(opcoes.length - 1, i + 1)].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); opcoes[Math.max(0, i - 1)].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); opcoes[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); opcoes[opcoes.length - 1].focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); escolher(o); }
        else if (e.key === 'Escape') { e.preventDefault(); fechar(true); }
        else if (e.key === 'Tab') fechar(false);
      });
    });
    document.addEventListener('click', function (e) { if (aberto() && !menu.contains(e.target)) fechar(false); });
    menos.addEventListener('click', function () { mudarZoom(-1); });
    mais.addEventListener('click', function () { mudarZoom(1); });
    atualizarBarra();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
