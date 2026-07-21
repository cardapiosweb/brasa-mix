// ============================================================
// BIBLIOTECA DE TEMAS VISUAIS
// ------------------------------------------------------------
// Cada tema define TODO o conceito visual do site: paleta de
// cores, fontes, ícone de fallback (quando a loja não tem logo)
// e o emoji usado nas imagens de placeholder.
//
// Pra criar o site de um cliente novo:
//   1. Copie a pasta do projeto (como já faz hoje).
//   2. No arquivo config-loja.js, defina: const TEMA = "hamburgueria"
//   3. Pronto. Não precisa editar CSS, HTML nem lembrar de trocar
//      nada manualmente — tudo é aplicado por aplicar-tema.js.
//
// Pra criar um tema novo do zero, copie um bloco existente,
// troque o nome da chave e ajuste os valores.
// ============================================================

const TEMAS = {

    pizzaria: {
        nomeExibicao: "Pizzaria",
        cores: {
            principal:        "#A9321E", // acento (também configurável por loja em cor_principal)
            principalEscura:  "#7A2416",
            principalClara:   "#F7E4DC",
            base:             "#241B16", // "carvão"
            baseSuave:        "#3A2C24",
            fundo:            "#FBF3E4", // "creme"
            destaque:         "#D9A441", // "dourado"
            selo:             "#4C6B3F", // "verde" (badges de oferta)
            linha:            "#E4D5B7"
        },
        fontes: {
            titulo: "Bitter",
            texto: "Mulish",
            script: "Caveat"
        },
        iconeFallbackLogo: "fa-pizza-slice",
        emojiPlaceholder: "🍕",
        textoAltLogo: "Logo da pizzaria"
    },

    churrascaria: {
        nomeExibicao: "Churrascaria",
        cores: {
            principal:        "#A9321E",
            principalEscura:  "#7A2416",
            principalClara:   "#F7E4DC",
            base:             "#241B16",
            baseSuave:        "#3A2C24",
            fundo:            "#FBF3E4",
            destaque:         "#D9A441",
            selo:             "#4C6B3F",
            linha:            "#E4D5B7"
        },
        fontes: {
            titulo: "Bitter",
            texto: "Mulish",
            script: "Caveat"
        },
        iconeFallbackLogo: "fa-fire-burner",
        emojiPlaceholder: "🍖",
        textoAltLogo: "Logo da churrascaria"
    },

    churrascaria2: {
        nomeExibicao: "Churrascaria (Brasa)",
        cores: {
            principal:        "#D94E1F",
            principalEscura:  "#A83913",
            principalClara:   "#FCE4D6",
            base:             "#1C1512",
            baseSuave:        "#2E231D",
            fundo:            "#FBEEE0",
            destaque:         "#F2A93C",
            selo:             "#4C6B3F",
            linha:            "#E8CFA9"
        },
        fontes: {
            titulo: "Bitter",
            texto: "Mulish",
            script: "Caveat"
        },
        iconeFallbackLogo: "fa-fire",
        emojiPlaceholder: "🔥",
        textoAltLogo: "Logo da churrascaria"
    },

    hamburgueria: {
        nomeExibicao: "Hamburgueria",
        cores: {
            principal:        "#C6491A",
            principalEscura:  "#95350F",
            principalClara:   "#FBE7D6",
            base:             "#1E1712",
            baseSuave:        "#332720",
            fundo:            "#FFF6E9",
            destaque:         "#E8B13A",
            selo:             "#3D6B3F",
            linha:            "#EAD9BE"
        },
        fontes: {
            titulo: "Bitter",
            texto: "Mulish",
            script: "Caveat"
        },
        iconeFallbackLogo: "fa-burger",
        emojiPlaceholder: "🍔",
        textoAltLogo: "Logo da hamburgueria"
    },

    doceria: {
        nomeExibicao: "Doceria / Confeitaria",
        cores: {
            principal:        "#C9457B",
            principalEscura:  "#9E2E5E",
            principalClara:   "#FBE3ED",
            base:             "#2B1B22",
            baseSuave:        "#402633",
            fundo:            "#FFF6F8",
            destaque:         "#E6B94D",
            selo:             "#6B7B4C",
            linha:            "#F0D3DE"
        },
        fontes: {
            titulo: "Bitter",
            texto: "Mulish",
            script: "Caveat"
        },
        iconeFallbackLogo: "fa-cake-candles",
        emojiPlaceholder: "🍰",
        textoAltLogo: "Logo da doceria"
    },

    acaiteria: {
        nomeExibicao: "Açaiteria / Sorveteria",
        cores: {
            principal:        "#5B2E8C",
            principalEscura:  "#411F66",
            principalClara:   "#EDE1F7",
            base:             "#1C1522",
            baseSuave:        "#2E2436",
            fundo:            "#F7F1FB",
            destaque:         "#E8B13A",
            selo:             "#3F7D5C",
            linha:            "#DCCBEE"
        },
        fontes: {
            titulo: "Bitter",
            texto: "Mulish",
            script: "Caveat"
        },
        iconeFallbackLogo: "fa-ice-cream",
        emojiPlaceholder: "🍧",
        textoAltLogo: "Logo da açaiteria"
    },

    generico: {
        // Tema neutro pra qualquer tipo de negócio que não tenha um
        // preset dedicado ainda — sirva de ponto de partida.
        nomeExibicao: "Genérico",
        cores: {
            principal:        "#2563EB",
            principalEscura:  "#1D4ED8",
            principalClara:   "#DBEAFE",
            base:             "#1E1E1E",
            baseSuave:        "#333333",
            fundo:            "#FAFAFA",
            destaque:         "#F59E0B",
            selo:             "#16A34A",
            linha:            "#E5E7EB"
        },
        fontes: {
            titulo: "Bitter",
            texto: "Mulish",
            script: "Caveat"
        },
        iconeFallbackLogo: "fa-store",
        emojiPlaceholder: "🏪",
        textoAltLogo: "Logo da loja"
    }
}

// Exporta pro escopo global (usado pelo aplicar-tema.js).
// Se um dia migrar pra módulos ES, troque por: export default TEMAS
window.TEMAS = TEMAS