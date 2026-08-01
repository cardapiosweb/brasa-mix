// ============================================================
// CONFIGURAÇÃO DESTE CLIENTE
// ------------------------------------------------------------
// Único arquivo que você precisa editar ao criar o site de um
// cliente novo (além de preencher os dados no admin.html).
//
// Escolha um dos temas cadastrados em temas.js:
//   "pizzaria", "churrascaria", "hamburgueria",
//   "doceria", "acaiteria", "generico"
//
// Pra criar um tema novo, edite temas.js — não precisa mexer
// no resto deste arquivo.
//
// Este arquivo é usado tanto pelo index.html (site público)
// quanto pelo admin.html (painel) — os dois carregam:
//   <script src="./temas.js"></script>
//   <script src="./config-loja.js"></script>
// ============================================================

const TEMA = "churrascaria2"

// ------------------------------------------------------------
// MODO DE ATENDIMENTO DESTE CLIENTE
// ------------------------------------------------------------
// O Brasa Mix atende só delivery/retirada, sem uso de mesas.
const MODO_LOJA = {
    permiteDelivery: true,
    permiteRetirada: true,
    usaMesa: false,
    usaDelivery: true,
}
window.MODO_LOJA = MODO_LOJA

// ------------------------------------------------------------
// ABAS DO PAINEL ADMIN — ORDEM E POSIÇÃO
// ------------------------------------------------------------
const ABAS_ADMIN = [
    { id: "garcom",            label: "Garçom",         icone: "fa-bell-concierge", posicao: "nav",  requer: "usaMesa",     bolinha: "bolinha-garcom" },
    { id: "mesas",              label: "Mesas",          icone: "fa-chair",          posicao: "nav",  requer: "usaMesa",     bolinha: "bolinha-mesas" },
    { id: "produtos",           label: "Produtos",       icone: "fa-utensils",       posicao: "nav",  requer: null },
    { id: "historico-delivery", label: "Delivery",       icone: "fa-motorcycle",     posicao: "nav",  requer: "usaDelivery", bolinha: "bolinha-historico-delivery" },
    { id: "historico-mesa",     label: "Histórico Mesa", icone: "fa-receipt",        posicao: "menu", requer: "usaMesa" },
    { id: "dashboard",          label: "Dashboard",      icone: "fa-gauge",          posicao: "menu", requer: null },
    { id: "loja",               label: "Dados da loja",  icone: "fa-store",          posicao: "menu", requer: null },
]
window.ABAS_ADMIN = ABAS_ADMIN

// ------------------------------------------------------------
// A partir daqui é só aplicação — não precisa editar.
// ------------------------------------------------------------
;(function () {
    const tema = (window.TEMAS && window.TEMAS[TEMA]) || window.TEMAS.generico

    if (!window.TEMAS || !window.TEMAS[TEMA]) {
        console.warn(`Tema "${TEMA}" não encontrado em temas.js — usando "generico" como reserva.`)
    }

    // Deixa acessível globalmente (ex: pro script.js saber o emoji do tema)
    window.TEMA_ATUAL = tema

    // ---- Variáveis CSS de cor (usadas pelo index.html) ----
    const raiz = document.documentElement.style
    raiz.setProperty("--laranja", tema.cores.principal)
    raiz.setProperty("--laranja-escuro", tema.cores.principalEscura)
    raiz.setProperty("--laranja-claro", tema.cores.principalClara)
    raiz.setProperty("--carvao", tema.cores.base)
    raiz.setProperty("--carvao-suave", tema.cores.baseSuave)
    raiz.setProperty("--creme", tema.cores.fundo)
    raiz.setProperty("--dourado", tema.cores.destaque)
    raiz.setProperty("--verde-manjericao", tema.cores.selo)
    raiz.setProperty("--linha", tema.cores.linha)

    // ---- Mesmas cores, com os nomes que o admin.html usa ----
    // (o admin tem seu próprio CSS com nomes de variável diferentes;
    // isso permite os dois arquivos usarem este mesmo config-loja.js
    // sem duplicar nada nem precisar renomear o CSS do admin)
    raiz.setProperty("--tinta", tema.cores.principal)
    raiz.setProperty("--tinta-escura", tema.cores.principalEscura)
    raiz.setProperty("--tinta-clara", tema.cores.principalClara)

    // ---- Fontes ----
    raiz.setProperty("--fonte-titulo", `'${tema.fontes.titulo}', serif`)
    raiz.setProperty("--fonte-texto", `'${tema.fontes.texto}', sans-serif`)
    raiz.setProperty("--fonte-script", `'${tema.fontes.script}', cursive`)

    const linkFontes = document.getElementById("fontes-tema")
    if (linkFontes) {
        const familias = [
            `${tema.fontes.titulo}:wght@500;600;700;800`,
            `${tema.fontes.texto}:wght@400;500;600;700`,
            `${tema.fontes.script}:wght@600;700`
        ].join("&family=")
        linkFontes.href = `https://fonts.googleapis.com/css2?family=${familias}&display=swap`
    }

    // ---- Função usada pelas fotos de produto que falham ao carregar ----
    // (chamada via onerror="imagemFallbackProduto(this)" ou
    // onerror="imagemFallbackProduto(this, '112x112')" no HTML/JS,
    // conforme o tamanho da imagem que estiver falhando)
    window.imagemFallbackProduto = function (img, tamanho = "480x360") {
        img.onerror = null
        const cor = tema.cores.principal.replace("#", "")
        img.src = `https://placehold.co/${tamanho}/${cor}/white?text=${encodeURIComponent(tema.emojiPlaceholder)}`
    }

    // ---- Ícone de fallback do logo + alt text (só existe no index.html;
    // no admin.html essas buscas simplesmente não encontram nada e são ignoradas) ----
    document.addEventListener("DOMContentLoaded", () => {
        const iconeFallback = document.querySelector("#header-banner .selo i")
        if (iconeFallback) {
            iconeFallback.className = `fa ${tema.iconeFallbackLogo} text-5xl`
            iconeFallback.style.color = "var(--laranja)"
        }
        const logoImg = document.getElementById("logo-img")
        if (logoImg) logoImg.setAttribute("alt", tema.textoAltLogo)
    })
})()