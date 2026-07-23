// ===========================
// ÍCONES POR CATEGORIA (fallback caso o produto não informe "icone")
// ===========================
const ICONE_PADRAO = "fa-star"

// ===========================
// ROLAGEM SUAVE MANUAL
// (mais confiável que window.scrollTo({behavior:"smooth"}), que
// costuma travar/pular em alguns navegadores e celulares)
// ===========================
function scrollSuavePara(destinoY, duracao = 500) {
    const inicioY = window.scrollY
    const distancia = destinoY - inicioY
    let inicioTempo = null

    function passo(tempoAtual) {
        if (inicioTempo === null) inicioTempo = tempoAtual
        const decorrido = tempoAtual - inicioTempo
        const progresso = Math.min(decorrido / duracao, 1)
        // easing suave (ease-in-out)
        const facilitado = progresso < 0.5
            ? 2 * progresso * progresso
            : 1 - Math.pow(-2 * progresso + 2, 2) / 2
        window.scrollTo(0, inicioY + distancia * facilitado)
        if (decorrido < duracao) {
            requestAnimationFrame(passo)
        }
    }
    requestAnimationFrame(passo)
}

// ===========================
// APLICAR DADOS DA LOJA NA PÁGINA
// (lê o objeto `loja` de dados-loja.js)
// ===========================
function aplicarDadosDaLoja() {
    document.title = loja.nome

    document.getElementById("header-banner").style.backgroundImage = `url('${loja.banner}')`
    document.getElementById("logo-img").src = loja.logo
    document.getElementById("logo-img").alt = `Logo ${loja.nome}`
    document.getElementById("loja-nome").textContent = loja.nome
    document.getElementById("loja-tagline").textContent = loja.tagline
    document.getElementById("loja-endereco").textContent = `Endereço: ${loja.endereco}`
    document.getElementById("loja-horario").textContent = loja.textoHorario
    document.getElementById("titulo-secao-menu").textContent = loja.tituloSecaoMenu

    document.getElementById("whats-flutuante").href = `https://wa.me/${loja.whatsapp}`

    // Aplica a cor principal da loja nas variáveis CSS — só se a loja
    // tiver cor customizada salva no admin. Se não tiver (null/vazio),
    // mantém a cor que o tema (config-loja.js/temas.js) já aplicou.
    if (loja.corPrincipal) {
        document.documentElement.style.setProperty("--laranja", loja.corPrincipal)
        document.documentElement.style.setProperty("--laranja-escuro", loja.corPrincipalEscura)
        document.documentElement.style.setProperty("--laranja-claro", loja.corPrincipalClara)
    }
}


// ===========================
// RENDERIZAR PRODUTOS
// (lê o array `produtos` de dados-produtos.js e monta o HTML)
//
// Campo opcional em cada produto: esgotado: true
// Quando presente, o produto aparece riscado, com um selo
// "Esgotado" e não pode ser adicionado ao carrinho.
// ===========================
function renderizarProdutos() {
    const menu = document.getElementById("menu")
    const nav = document.getElementById("categorias-nav")
    menu.innerHTML = ""
    if (nav) nav.innerHTML = ""

    // Modo delivery esconde produtos "só retirada"
    const produtosVisiveis = modoMesa
        ? produtos
        : produtos.filter(p => !p.retirada_apenas)

    // Agrupa produtos por categoria
    const produtosPorCategoria = {}

    produtosVisiveis.forEach(produto => {
        if (!produtosPorCategoria[produto.categoria]) {
            produtosPorCategoria[produto.categoria] = []
        }
        produtosPorCategoria[produto.categoria].push(produto)
    })

    // Ordem de exibição vem do objeto "categorias" (declarado em
    // dados-produtos.js). Categorias com produtos mas não declaradas
    // ali ainda aparecem, jogadas no final, como rede de segurança.
    const categoriasComProdutos = Object.keys(produtosPorCategoria)
    const ordemDeclarada = Object.keys(categorias).filter(c => categoriasComProdutos.includes(c))
    const ordemNaoDeclarada = categoriasComProdutos.filter(c => !ordemDeclarada.includes(c))
    const ordemFinal = [...ordemDeclarada, ...ordemNaoDeclarada]

    ordemFinal.forEach((categoria, index) => {
        const icone = (categorias[categoria] && categorias[categoria].icone) || ICONE_PADRAO
        const gridId = `categoria-grid-${index}`
        const tituloId = `categoria-titulo-${index}`

        // Título da categoria (clicável)
        const tituloWrapper = document.createElement("div")
        tituloWrapper.id = tituloId
        tituloWrapper.className = "mx-auto max-w-7xl px-4 mb-4 cursor-pointer select-none"
        tituloWrapper.innerHTML = `
            <h2 class="font-bold text-2xl category-title flex items-center gap-2">
                <i class="fa fa-chevron-down category-chevron"></i>
                <i class="fa ${icone}" style="color: var(--laranja);"></i> ${categoria}
            </h2>
        `
        menu.appendChild(tituloWrapper)

        // Grade de produtos da categoria
        const grid = document.createElement("main")
        grid.id = gridId
        grid.className = "grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 mx-auto max-w-7xl px-4 mb-12 categoria-grid"

        produtosPorCategoria[categoria].forEach(produto => {
            grid.appendChild(criarCardProduto(produto))
        })

        menu.appendChild(grid)

        // Clique no título esconde/mostra os produtos dessa categoria
        tituloWrapper.addEventListener("click", () => {
            const chevron = tituloWrapper.querySelector(".category-chevron")
            const estaAberta = !grid.classList.contains("categoria-fechada")

            if (estaAberta) {
                // Fechar: fixa a altura atual antes de animar pra 0
                grid.style.maxHeight = grid.scrollHeight + "px"
                requestAnimationFrame(() => {
                    grid.classList.add("categoria-fechada")
                    grid.style.maxHeight = "0px"
                })
            } else {
                // Abrir: anima até a altura real do conteúdo
                grid.classList.remove("categoria-fechada")
                grid.style.maxHeight = grid.scrollHeight + "px"
            }

            chevron.classList.toggle("chevron-fechado")
        })

        // Botão de atalho na barra de categorias
        if (nav) {
            const navBtn = document.createElement("button")
            navBtn.className = "categoria-nav-btn"
            navBtn.type = "button"
            navBtn.textContent = categoria
            navBtn.addEventListener("click", () => {
                nav.querySelectorAll(".categoria-nav-btn").forEach(b => b.classList.remove("ativa"))
                navBtn.classList.add("ativa")

                // Se a categoria estiver fechada, abre ela também
                if (grid.classList.contains("categoria-fechada")) {
                    tituloWrapper.click()
                }

                // Rolagem manual e suave (mais confiável do que o
                // comportamento nativo do navegador)
                const alvo = document.getElementById(tituloId)
                const posicao = alvo.getBoundingClientRect().top + window.scrollY - 16
                scrollSuavePara(posicao)
            })
            nav.appendChild(navBtn)
        }
    })
}

function criarCardProduto(produto) {
    const precoFormatado = produto.preco.toFixed(2).replace(".", ",")
    const esgotado = !!produto.esgotado
    const semSetas = !!produto.esconder_setas
    const esconderPreco = semSetas && produto.preco === 0
    const badgeOferta = produto.oferta ? `<span class="badge-oferta">Oferta</span>` : ""
    const badgeEsgotado = esgotado ? `<span class="badge-esgotado">Esgotado</span>` : ""

    const card = document.createElement("div")
    card.className = "flex gap-6" + (esgotado ? " produto-esgotado" : "")
    card.innerHTML = `
        <img src="${produto.fotos[0]}" alt="${produto.nome}"
            class="w-28 h-28 rounded-md object-cover hover:scale-110 hover:rotate-2 duration-200 product-clickable"
            onerror="imagemFallbackProduto(this, '112x112')"
        />
        <div class="product-info">
            <p class="font-bold product-name-clickable">
                ${produto.nome}
                ${badgeOferta}
                ${badgeEsgotado}
            </p>
            <p class="text-sm text-gray-600">${produto.desc}</p>
            <div class="product-footer">
                ${esconderPreco ? "<span></span>" : `<p class="font-bold text-lg text-laranja">R$ ${precoFormatado}</p>`}
                <div class="product-footer-actions">
                    ${semSetas ? "" : `
                    <div class="qty-selector" data-qty="1">
                        <button class="qty-btn qty-decrease" type="button">−</button>
                        <span class="qty-value">1</span>
                        <button class="qty-btn qty-increase" type="button">+</button>
                    </div>`}
                    <button class="add-to-cart-btn${esgotado ? " esgotado-btn" : ""}" data-id="${produto.id}" data-name="${produto.nome}" data-price="${produto.preco}" data-esgotado="${esgotado}">
                        <i class="fa ${esgotado ? "fa-ban" : "fa-cart-plus"} text-lg"></i>
                    </button>
                </div>
            </div>
        </div>
    `

    // Clique na imagem e no nome abrem o modal do produto
    // (mesmo esgotado, o cliente pode ver os detalhes)
    const img = card.querySelector("img")
    const nome = card.querySelector(".product-name-clickable")
    const abrir = () => abrirProduto(produto)
    img.addEventListener("click", abrir)
    nome.addEventListener("click", abrir)

    return card
}


// ===========================
// SELETORES (elementos fixos da página)
// ===========================
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const addressRua = document.getElementById("address-rua")
const addressNumero = document.getElementById("address-numero")
const addressBairro = document.getElementById("address-bairro")
const addressReferencia = document.getElementById("address-referencia")
const addressWarn = document.getElementById("address-warn")
const addressSection = document.getElementById("address-section")
const optEntrega = document.getElementById("opt-entrega")
const optRetirada = document.getElementById("opt-retirada")

document.getElementById("modal-qty-increase").addEventListener("click", () => {
    const seletor = document.getElementById("modal-qty-selector")
    const qtdAtual = parseInt(seletor.getAttribute("data-qty"), 10)
    const disponivel = estoqueDisponivel(produtoAtual.id)

    if (qtdAtual + 1 > disponivel) {
        avisarEstoqueInsuficiente(disponivel)
        return
    }

    const qtd = qtdAtual + 1
    seletor.setAttribute("data-qty", qtd)
    document.getElementById("modal-qty-value").textContent = qtd
})
document.getElementById("modal-qty-decrease").addEventListener("click", () => {
    const seletor = document.getElementById("modal-qty-selector")
    const qtd = Math.max(1, parseInt(seletor.getAttribute("data-qty"), 10) - 1)
    seletor.setAttribute("data-qty", qtd)
    document.getElementById("modal-qty-value").textContent = qtd
})

// ===========================
// MODO MESA (?mesa=NN na URL)
// Quando presente, o site sabe que o pedido é de uma mesa
// específica: esconde entrega/retirada, endereço e pagamento.
// ===========================
const paramsUrl = new URLSearchParams(window.location.search)
const mesaAtual = paramsUrl.get("mesa")
const modoMesa = !!mesaAtual

function aplicarModoMesa() {
    if (!modoMesa) return

    document.getElementById("delivery-type-section")?.classList.add("oculto-modo")
    document.getElementById("address-section")?.classList.add("oculto-modo")
    document.getElementById("payment-section")?.classList.add("oculto-modo")

    tipoEntrega = "mesa"
}

// ===========================
// ESTADO
// ===========================
let cart = []
let tipoEntrega = "entrega"
let tipoPagamento = "Pix"

// ===========================
// MODO DARK
// ===========================
const darkToggle = document.getElementById("dark-toggle")
const darkIcon = document.getElementById("dark-icon")

if (localStorage.getItem("dark") === "true") {
    document.body.classList.add("dark")
    darkIcon.classList.replace("fa-moon", "fa-sun")
}

darkToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark")
    const isDark = document.body.classList.contains("dark")
    localStorage.setItem("dark", isDark)
    darkIcon.classList.toggle("fa-moon", !isDark)
    darkIcon.classList.toggle("fa-sun", isDark)
})


// ===========================
// MODAL DO CARRINHO
// ===========================
cartBtn.addEventListener("click", function () {
    updateCartModal()
    const modalJaAberto = cartModal.style.display === "flex"
    cartModal.style.display = "flex"
    document.body.style.overflow = "hidden"

    // Empilha estado apenas uma vez se não estiver aberto
    if (!modalJaAberto) {
        history.pushState({ carrinhoModalAberto: true }, "")
    }
})

function fecharModalCarrinho() {
    cartModal.style.display = "none"
    document.body.style.overflow = ""

    // Remove estado do histórico se existir
    if (history.state && history.state.carrinhoModalAberto) {
        history.back()
    }
}

cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        fecharModalCarrinho()
    }
})

closeModalBtn.addEventListener("click", function () {
    fecharModalCarrinho()
})


// ===========================
// ENTREGA OU RETIRADA
// ===========================
function selecionarEntrega(tipo) {
    tipoEntrega = tipo

    if (tipo === "entrega") {
        optEntrega.classList.add("selected")
        optRetirada.classList.remove("selected")
        addressSection.style.display = "block"
    } else {
        optRetirada.classList.add("selected")
        optEntrega.classList.remove("selected")
        addressSection.style.display = "none"
        addressWarn.classList.add("hidden")
        addressInput.classList.remove("border-red-500")
    }
}


// ===========================
// FORMA DE PAGAMENTO
// ===========================
function selecionarPagamento(tipo) {
    tipoPagamento = tipo
    document.getElementById("pag-pix").classList.toggle("selected", tipo === "Pix")
    document.getElementById("pag-dinheiro").classList.toggle("selected", tipo === "Dinheiro")
    document.getElementById("pag-cartao").classList.toggle("selected", tipo === "Cartão na entrega")
}


// ===========================
// VALIDAÇÃO DE ESTOQUE EM TEMPO REAL
// Calcula quanto ainda pode ser adicionado de um produto,
// descontando o que já está no carrinho (soma todas as variantes/
// opções desse mesmo produto, já que compartilham o mesmo estoque).
// Produtos com estoque = null/undefined não são controlados (Infinity).
// ===========================
function estoqueDisponivel(produtoId) {
    const produto = produtos.find(p => String(p.id) === String(produtoId))
    if (!produto || produto.estoque === null || produto.estoque === undefined) return Infinity

    const jaNoCarrinho = cart
        .filter(item => String(item.id) === String(produtoId))
        .reduce((soma, item) => soma + item.quantity, 0)

    return produto.estoque - jaNoCarrinho
}

function avisarEstoqueInsuficiente(disponivel) {
    Toastify({
        text: disponivel > 0
            ? `😕 Só temos ${disponivel} unidade(s) disponível(is) desse produto.`
            : `😕 Esse produto está esgotado no momento.`,
        duration: 2200,
        gravity: "top",
        position: "right",
        style: { background: "#6b7280", borderRadius: "8px" },
    }).showToast()
}


// ===========================
// ADICIONAR AO CARRINHO
// (usa "delegação de evento" no #menu, funciona mesmo com os
// cards sendo criados dinamicamente pelo renderizarProdutos)
// ===========================
document.getElementById("menu").addEventListener("click", function (event) {
    const increaseBtn = event.target.closest(".qty-increase")
    const decreaseBtn = event.target.closest(".qty-decrease")
    if (increaseBtn || decreaseBtn) {
        const seletor = event.target.closest(".qty-selector")
        const btnCarrinho = seletor.parentElement.querySelector(".add-to-cart-btn")
        const produtoId = btnCarrinho ? btnCarrinho.getAttribute("data-id") : null

        let qtd = parseInt(seletor.getAttribute("data-qty"), 10)

        if (increaseBtn) {
            const disponivel = estoqueDisponivel(produtoId)
            if (qtd + 1 > disponivel) {
                avisarEstoqueInsuficiente(disponivel)
                return
            }
            qtd += 1
        } else {
            qtd = Math.max(1, qtd - 1)
        }

        seletor.setAttribute("data-qty", qtd)
        seletor.querySelector(".qty-value").textContent = qtd
        return
    }

    let parentButton = event.target.closest(".add-to-cart-btn")
    if (parentButton) {
        // Produto esgotado: avisa e não adiciona
        if (parentButton.getAttribute("data-esgotado") === "true") {
            Toastify({
                text: "😕 Esse produto está esgotado no momento.",
                duration: 1000,
                gravity: "top",
                position: "right",
                style: { background: "#6b7280", borderRadius: "8px" },
            }).showToast()
            return
        }

        const id = parentButton.getAttribute("data-id")
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))
        const seletor = parentButton.closest(".product-footer").querySelector(".qty-selector")
        const qtd = seletor ? parseInt(seletor.getAttribute("data-qty"), 10) : 1

        const produtoCompleto = produtos.find(p => String(p.id) === id)

        if (produtoCompleto && produtoCompleto.opcoes) {
            abrirModalOpcoes(produtoCompleto, qtd)
        } else {
            addToCart(id, name, price, parentButton, qtd)
        }

        if (seletor) {
            seletor.setAttribute("data-qty", "1")
            seletor.querySelector(".qty-value").textContent = "1"
        }
    }
})

function addToCart(id, name, price, btnElement, quantity = 1, opcoesSelecionadas = null) {
    const disponivel = estoqueDisponivel(id)
    if (quantity > disponivel) {
        avisarEstoqueInsuficiente(disponivel)
        return
    }

    const precoAdicional = opcoesSelecionadas
        ? opcoesSelecionadas.reduce((soma, item) => soma + item.preco_adicional, 0)
        : 0
    const precoFinal = price + precoAdicional

    // Itens com opções diferentes viram linhas separadas no carrinho
    const chave = opcoesSelecionadas
        ? `${id}__${opcoesSelecionadas.map(o => o.nome).sort().join(",")}`
        : id

    const existingItem = cart.find(item => item.chave === chave)

    if (existingItem) {
        existingItem.quantity += quantity
    } else {
        cart.push({ id, chave, name, price: precoFinal, quantity, opcoes: opcoesSelecionadas })
    }

    updateCartModal()

    if (btnElement) {
        btnElement.classList.add("cart-animate")
        setTimeout(() => btnElement.classList.remove("cart-animate"), 600)
    }

    cartCounter.classList.add("counter-animate")
    setTimeout(() => cartCounter.classList.remove("counter-animate"), 400)

    Toastify({
        text: `✅ "${name}" adicionado!`,
        duration: 1000,
        gravity: "top",
        position: "right",
        stopOnFocus: false,
        style: {
            background: loja.corPrincipal,
            borderRadius: "8px",
            fontSize: "14px",
        },
    }).showToast()
}


// ===========================
// ATUALIZAR MODAL DO CARRINHO
// ===========================
function updateCartModal() {
    cartItemsContainer.innerHTML = ""
    let total = 0

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-6 text-gray-400">
                <i class="fa fa-shopping-cart text-4xl mb-2 block"></i>
                <p>Seu carrinho está vazio</p>
            </div>
        `
        cartTotal.textContent = "R$ 0,00"
        cartCounter.textContent = "0"
        return
    }

    cart.forEach(item => {
        const cartItemElement = document.createElement("div")
        cartItemElement.classList.add("flex", "justify-between", "items-center", "mb-4", "pb-3", "border-b")

        const opcoesTexto = item.opcoes && item.opcoes.length
            ? `<p class="text-xs text-gray-500">${agruparOpcoesPorGrupo(item.opcoes).join(" · ")}</p>`
            : ""

        cartItemElement.innerHTML = `
            <div class="flex-1">
                <p class="font-bold text-sm">${item.name}</p>
                ${opcoesTexto}
                <p class="text-xs text-gray-500">R$ ${item.price.toFixed(2).replace(".", ",")} cada</p>
            </div>
            <div class="flex items-center gap-2 mx-3">
                <button class="decrease-btn w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100" data-chave="${item.chave}">−</button>
                <span class="font-bold w-5 text-center">${item.quantity}</span>
                <button class="increase-btn w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100" data-chave="${item.chave}">+</button>
            </div>
            <div class="text-right min-w-[70px]">
                <p class="font-bold text-sm" style="color: var(--laranja);">
                    R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}
                </p>
                <button class="remove-from-cart-btn text-xs text-red-400 hover:text-red-600 mt-1" data-chave="${item.chave}">Remover</button>
            </div>
        `

        total += item.price * item.quantity
        cartItemsContainer.appendChild(cartItemElement)
    })

    cartTotal.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

    const totalItens = cart.reduce((sum, item) => sum + item.quantity, 0)
    cartCounter.textContent = totalItens
}


// ===========================
// CONTROLES DE QUANTIDADE E REMOÇÃO
// ===========================
cartItemsContainer.addEventListener("click", function (event) {
    const chave = event.target.getAttribute("data-chave")

    if (event.target.classList.contains("remove-from-cart-btn")) removeItemCart(chave)
    if (event.target.classList.contains("increase-btn")) increaseItem(chave)
    if (event.target.classList.contains("decrease-btn")) decreaseItem(chave)
})

function increaseItem(chave) {
    const item = cart.find(i => i.chave === chave)
    if (!item) return

    const disponivel = estoqueDisponivel(item.id)
    if (disponivel < 1) {
        avisarEstoqueInsuficiente(0)
        return
    }

    item.quantity += 1
    updateCartModal()
}

function decreaseItem(chave) {
    const item = cart.find(i => i.chave === chave)
    if (item) {
        if (item.quantity > 1) { item.quantity -= 1; updateCartModal() }
        else { removeItemCart(chave) }
    }
}

function removeItemCart(chave) {
    const index = cart.findIndex(item => item.chave === chave)
    if (index !== -1) { cart.splice(index, 1); updateCartModal() }
}


// ===========================
// VALIDAÇÃO DO ENDEREÇO
// ===========================
function limparAvisoEndereco() {
    if (addressRua.value.trim() !== "" && addressBairro.value.trim() !== "") {
        addressRua.classList.remove("border-red-500")
        addressBairro.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")
    }
}
addressRua.addEventListener("input", limparAvisoEndereco)
addressBairro.addEventListener("input", limparAvisoEndereco)


// ===========================
// BAIXA DE ESTOQUE
// Roda no momento em que um pedido é finalizado (mesa, delivery
// ou retirada). Recebe o carrinho e desconta a quantidade comprada
// do estoque de cada produto. Produtos com estoque = null não são
// controlados, então são ignorados. Ao chegar a 0, marca esgotado
// automaticamente (assim o produto já aparece indisponível pro
// próximo cliente, sem precisar o lojista mexer no admin).
// ===========================
async function baixarEstoque(itensCarrinho) {
    for (const item of itensCarrinho) {
        try {
            const { data: prod, error: erroBusca } = await supabaseClient
                .from("produtos")
                .select("estoque")
                .eq("id", item.id)
                .single()

            if (erroBusca || !prod || prod.estoque === null || prod.estoque === undefined) continue

            const novoEstoque = Math.max(0, prod.estoque - item.quantity)
            const atualizacao = { estoque: novoEstoque }
            if (novoEstoque === 0) atualizacao.esgotado = true

            await supabaseClient.from("produtos").update(atualizacao).eq("id", item.id)
        } catch (err) {
            console.error("Erro ao baixar estoque do produto", item.id, err)
        }
    }
}


// ===========================
// FINALIZAR PEDIDO
// Modo delivery/retirada: comportamento de sempre, manda pro WhatsApp.
// Modo mesa: grava o pedido em `pedidos_mesa` no Supabase, sem WhatsApp;
// o atendimento acompanha e finaliza a comanda pelo painel admin (é lá
// que a baixa de estoque da mesa acontece, na finalização da comanda).
// ===========================
checkoutBtn.addEventListener("click", async function () {

    const isOpen = checkStoreOpen()
    if (!isOpen) {
        Toastify({
            text: "Ops! A loja está fechada no momento.",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: { background: "#ef4444", borderRadius: "8px" },
        }).showToast()
        return
    }

    if (cart.length === 0) {
        Toastify({
            text: "Adicione produtos ao carrinho primeiro!",
            duration: 2500,
            gravity: "top",
            position: "right",
            style: { background: "#f59e0b", borderRadius: "8px" },
        }).showToast()
        return
    }

    // ---- MODO MESA: grava no banco, não vai pro WhatsApp ----
    // (a baixa de estoque da mesa acontece só quando a comanda é
    // finalizada no painel admin, não a cada pedido enviado daqui)
    if (modoMesa) {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

        checkoutBtn.disabled = true

        const { error } = await supabaseClient.from("pedidos_mesa").insert({
            loja_id: loja.id,
            mesa: mesaAtual,
            itens: cart,
            total
        })

        checkoutBtn.disabled = false

        if (error) {
            Toastify({
                text: "Erro ao enviar pedido, tente de novo.",
                duration: 2500,
                gravity: "top",
                position: "right",
                style: { background: "#ef4444", borderRadius: "8px" },
            }).showToast()
            return
        }

        Toastify({
            text: "✅ Pedido enviado pra cozinha!",
            duration: 2000,
            gravity: "top",
            position: "right",
            style: { background: loja.corPrincipal, borderRadius: "8px" },
        }).showToast()

        cart = []
        updateCartModal()
        fecharModalCarrinho()
        return
    }

    // ---- MODO DELIVERY/RETIRADA: fluxo original, vai pro WhatsApp ----
    if (tipoEntrega === "entrega" && (addressRua.value.trim() === "" || addressBairro.value.trim() === "")) {
        addressWarn.classList.remove("hidden")
        if (addressRua.value.trim() === "") addressRua.classList.add("border-red-500")
        if (addressBairro.value.trim() === "") addressBairro.classList.add("border-red-500")
        ;(addressRua.value.trim() === "" ? addressRua : addressBairro).focus()
        return
    }

    const cartItems = cart.map(item => {
        const linhaOpcoes = item.opcoes && item.opcoes.length
            ? "\n  " + agruparOpcoesPorGrupo(item.opcoes).join("\n  ")
            : ""
        const produtoRef = produtos.find(p => String(p.id) === String(item.id))
        const esconderQtd = produtoRef && produtoRef.esconder_setas && item.quantity === 1
        const linhaQtd = esconderQtd ? "" : `Qtd: ${item.quantity} | `
        return `- ${item.name}${linhaOpcoes}\n  ${linhaQtd}R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}`
    }).join("\n")

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalFormatado = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

    const agora = new Date()
    const dataHoraFormatada = agora.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })

    const linhaRuaNumero = addressRua.value.trim() + (addressNumero.value.trim() ? ` - nº ${addressNumero.value.trim()}` : "")

    const enderecoCompleto = [
        `Endereço: ${linhaRuaNumero}`,
        addressBairro.value.trim() ? `Bairro: ${addressBairro.value.trim()}` : "",
        addressReferencia.value.trim() ? `Referência: ${addressReferencia.value.trim()}` : ""
    ].filter(Boolean).join("\n")

    const modoEntrega = tipoEntrega === "entrega"
        ? `*Entrega*\n${enderecoCompleto}`
        : `*Retirada na loja*`

    const linhaPagamento = `\n*Pagamento:* ${tipoPagamento}`

    const message =
        `*Pedido - ${loja.nome}*\n` +
        `Data/Hora: ${dataHoraFormatada}\n` +
        `--------------------------------\n` +
        `${cartItems}\n` +
        `--------------------------------\n` +
        `*Total: ${totalFormatado}*\n` +
        `\n${modoEntrega}\n` +
        linhaPagamento

    window.open(`https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(message)}`, "_blank")

    // Soma os itens (mesmo formato usado no histórico de mesa) —
    // reaproveitado tanto pro relatório do dia quanto pro histórico.
    const itensSomados = {}
    cart.forEach(item => {
        const chave = item.chave || item.name
        if (!itensSomados[chave]) itensSomados[chave] = { name: item.name, opcoes: item.opcoes, quantity: 0, price: item.price }
        itensSomados[chave].quantity += item.quantity
    })

    // Alimenta o relatório do dia (Dashboard). Tabela leve, se autolimpa
    // sozinha — não pode travar nada, o WhatsApp já foi enviado na linha
    // acima, isso é só um registro extra pro dono acompanhar o dia.
    try {
        await supabaseClient.from("relatorio_dia").insert({
            loja_id: loja.id,
            origem: tipoEntrega,   // 'entrega' ou 'retirada'
            itens: itensSomados,
            total
        })
    } catch (err) {
        console.error("Erro ao registrar no relatório do dia", err)
    }

    // Grava no histórico de delivery (mesma lógica e limite do histórico
    // de mesa — a aba "Histórico Delivery" no admin lê daqui, filtrando
    // origem = 'delivery' e mostrando só os 30 mais recentes). Guarda o
    // texto EXATO que foi enviado ao WhatsApp. Não bloqueia o fluxo se
    // falhar, o pedido já foi enviado.
    try {
        await supabaseClient.from("comandas_finalizadas").insert({
            loja_id: loja.id,
            origem: "delivery",
            mesa: null,
            mensagem: message,
            total,
            itens: itensSomados
        })
    } catch (err) {
        console.error("Erro ao salvar histórico de delivery", err)
    }

    // Baixa o estoque dos produtos comprados (delivery/retirada finaliza
    // aqui mesmo, ao contrário da mesa, que só finaliza depois no admin)
    baixarEstoque(cart)

    cart = []
    tipoEntrega = "entrega"
    tipoPagamento = "Pix"
    selecionarEntrega("entrega")
    selecionarPagamento("Pix")
    addressRua.value = ""
    addressNumero.value = ""
    addressBairro.value = ""
    addressReferencia.value = ""
    updateCartModal()
    fecharModalCarrinho()
})


// ===========================
// VERIFICAR HORÁRIO DA LOJA
// ===========================
function checkStoreOpen() {
    const dias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
    const agora = new Date()
    const diaDeHoje = dias[agora.getDay()]
    const hora = agora.getHours()
    let intervalosHoje = loja.horario[diaDeHoje]

    if (!intervalosHoje) return false

    // Compatibilidade: se vier no formato antigo (objeto único),
    // transforma em array de 1 item
    if (!Array.isArray(intervalosHoje)) {
        intervalosHoje = [intervalosHoje]
    }

    return intervalosHoje.some(({ abre, fecha }) => {
        if (abre === fecha) return false
        if (fecha < abre) {
            return hora >= abre || hora < fecha
        }
        return hora >= abre && hora < fecha
    })
}

function aplicarStatusLoja() {
    const spanItem = document.getElementById("date-span")
    const isOpen = checkStoreOpen()

    if (isOpen) {
        spanItem.classList.remove("bg-red-500")
        spanItem.classList.add("bg-green-600")
    } else {
        spanItem.classList.remove("bg-green-600")
        spanItem.classList.add("bg-red-500")
    }
}


// ===========================
// MODAL DE PRODUTO
// ===========================
let produtoAtual = null
let fotosAtual = []

function abrirProduto(produto) {
    produtoAtual = produto
    fotosAtual = produto.fotos

    document.getElementById("modal-qty-selector").setAttribute("data-qty", "1")
    document.getElementById("modal-qty-value").textContent = "1"
    document.getElementById("modal-qty-selector").style.display = produto.esconder_setas ? "none" : "flex"

    const modalJaAberto = document.getElementById("product-modal").classList.contains("open")

    document.getElementById("modal-main-img").src = fotosAtual[0]
    document.getElementById("modal-main-img").alt = produto.nome

    // Monta a galeria com quantas fotos o produto tiver (1, 2, 3...).
    // Se só tiver 1 foto, não mostra miniaturas.
    const galeria = document.getElementById("modal-gallery")
    galeria.innerHTML = ""
    if (fotosAtual.length > 1) {
        fotosAtual.forEach((foto, i) => {
            const thumb = document.createElement("img")
            thumb.src = foto
            thumb.alt = `Foto ${i + 1}`
            if (i === 0) thumb.classList.add("active")
            thumb.onerror = function () { imagemFallbackProduto(thumb, "200x200") }
            thumb.addEventListener("click", () => trocarFoto(i))
            galeria.appendChild(thumb)
        })
    }

    document.getElementById("modal-name").textContent = produto.nome
    document.getElementById("modal-desc").textContent = produto.desc

    const esconderPrecoModal = produto.esconder_setas && produto.preco === 0
    document.getElementById("modal-price").textContent = esconderPrecoModal ? "" : "R$ " + produto.preco.toFixed(2).replace(".", ",")

    const modalAddBtn = document.getElementById("modal-add-btn")
    if (produto.esgotado) {
        modalAddBtn.classList.add("esgotado-btn")
        modalAddBtn.innerHTML = `<i class="fa fa-ban"></i> Esgotado`
        modalAddBtn.onclick = function () {
            Toastify({
                text: "😕 Esse produto está esgotado no momento.",
                duration: 2500,
                gravity: "top",
                position: "right",
                style: { background: "#6b7280", borderRadius: "8px" },
            }).showToast()
        }
    } else {
        modalAddBtn.classList.remove("esgotado-btn")
        modalAddBtn.innerHTML = `<i class="fa fa-cart-plus"></i> Adicionar`
        modalAddBtn.onclick = function () {
            const qtd = parseInt(document.getElementById("modal-qty-selector").getAttribute("data-qty"), 10)
            if (produto.opcoes) {
                document.getElementById("product-modal").classList.remove("open")
                document.body.style.overflow = "hidden"
                abrirModalOpcoes(produto, qtd)
            } else {
                addToCart(produtoAtual.id, produtoAtual.nome, produtoAtual.preco, null, qtd)
                fecharModalProduto()
            }
        }
    }

    document.getElementById("modal-whats-btn").onclick = function () {
        const precoFormatado = produto.preco.toFixed(2).replace(".", ",")
        const msg = encodeURIComponent(`Quero saber mais sobre: ${produto.nome} - R$ ${precoFormatado} (${produto.categoria})`)
        window.open(`https://wa.me/${loja.whatsapp}?text=${msg}`, "_blank")
    }

    document.getElementById("modal-share-btn").onclick = function () {
        const precoFormatado = produto.preco.toFixed(2).replace(".", ",")
        const siteUrl = window.location.href
        const msg =
            `Olha esse produto que achei na ${loja.nome}!\n\n` +
            `*${produto.nome}*\n` +
            `Preco: R$ ${precoFormatado}\n` +
            `Categoria: ${produto.categoria}\n\n` +
            `Acesse: ${siteUrl}`
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank")
    }

    document.getElementById("product-modal").classList.add("open")
    document.body.style.overflow = "hidden"

    // Empilha uma marcação no histórico só na abertura (não de novo se
    // o usuário clicar em outro produto com o modal já aberto)
    if (!modalJaAberto) {
        history.pushState({ produtoModalAberto: true }, "")
    }
}

function trocarFoto(index) {
    document.getElementById("modal-main-img").src = fotosAtual[index]
    const thumbs = document.getElementById("modal-gallery").querySelectorAll("img")
    thumbs.forEach((thumb, i) => thumb.classList.toggle("active", i === index))
}

function fecharModalProduto() {
    document.getElementById("product-modal").classList.remove("open")
    document.body.style.overflow = ""

    // Se tinha uma marcação empilhada pro modal, remove ela do histórico
    // (assim o botão de voltar não fica "gastando" um clique à toa depois)
    if (history.state && history.state.produtoModalAberto) {
        history.back()
    }
}

function fecharModalProdutoSeOverlay(event) {
    if (event.target === document.getElementById("product-modal")) {
        fecharModalProduto()
    }
}

// ===========================
// MODAL DE OPÇÕES (sabores, adicionais etc.)
// Só é usado quando produto.opcoes existe.
// ===========================
let opcoesEscolhidas = {}
let produtoOpcoesAtual = null
let quantidadeOpcoesAtual = 1

function abrirModalOpcoes(produto, quantidade) {
    produtoOpcoesAtual = produto
    quantidadeOpcoesAtual = quantidade
    opcoesEscolhidas = {}

    document.getElementById("options-nome").textContent = produto.nome

    const container = document.getElementById("options-grupos")
    container.innerHTML = ""

    produto.opcoes.forEach(grupo => {
        opcoesEscolhidas[grupo.nome] = []

        const textoLimite = grupo.obrigatorio
            ? `Mín: ${grupo.min} · Máx: ${grupo.max}`
            : `Opcional · Máx: ${grupo.max}`

        const grupoDiv = document.createElement("div")
        grupoDiv.className = "options-grupo"
        grupoDiv.innerHTML = `
            <p class="options-grupo-titulo">
                <span>${grupo.nome}${grupo.obrigatorio ? " *" : ""}</span>
                <span class="options-grupo-limite">${textoLimite}</span>
            </p>
        `

        grupo.itens.forEach(item => {
            const itemDiv = document.createElement("div")
            itemDiv.className = "options-item"
            itemDiv.innerHTML = `
                <span>${item.nome}</span>
                ${item.preco_adicional > 0 ? `<span class="options-item-preco">+R$ ${item.preco_adicional.toFixed(2).replace(".", ",")}</span>` : ""}
            `
            itemDiv.addEventListener("click", () => alternarOpcao(grupo, item, itemDiv))
            grupoDiv.appendChild(itemDiv)
        })

        container.appendChild(grupoDiv)
    })

    atualizarTotalOpcoes()

    document.getElementById("options-modal").classList.add("open")
    document.body.style.overflow = "hidden"
    history.pushState({ opcoesModalAberto: true }, "")
}

function alternarOpcao(grupo, item, itemDiv) {
    const selecionadosGrupo = opcoesEscolhidas[grupo.nome]
    const jaSelecionado = selecionadosGrupo.some(i => i.nome === item.nome)

    if (jaSelecionado) {
        opcoesEscolhidas[grupo.nome] = selecionadosGrupo.filter(i => i.nome !== item.nome)
        itemDiv.classList.remove("selecionado")
    } else if (grupo.max === 1) {
        // Seleção única: desmarca o anterior do mesmo grupo
        opcoesEscolhidas[grupo.nome] = [{ ...item, grupo: grupo.nome }]
        itemDiv.parentElement.querySelectorAll(".options-item").forEach(el => el.classList.remove("selecionado"))
        itemDiv.classList.add("selecionado")
    } else {
        if (selecionadosGrupo.length >= grupo.max) {
            Toastify({
                text: `Você pode escolher até ${grupo.max} opções em "${grupo.nome}".`,
                duration: 2000,
                gravity: "top",
                position: "right",
                style: { background: "#f59e0b", borderRadius: "8px" },
            }).showToast()
            return
        }
        opcoesEscolhidas[grupo.nome].push({ ...item, grupo: grupo.nome })
        itemDiv.classList.add("selecionado")
    }

    atualizarTotalOpcoes()
}

function agruparOpcoesPorGrupo(opcoes) {
    const porGrupo = {}
    const ordemGrupos = []
    opcoes.forEach(o => {
        const g = o.grupo || "Opções"
        if (!porGrupo[g]) { porGrupo[g] = []; ordemGrupos.push(g) }
        porGrupo[g].push(o.nome)
    })
    return ordemGrupos.map(g => `${g}: ${porGrupo[g].join(", ")}`)
}

function atualizarTotalOpcoes() {
    let totalAdicional = 0
    Object.values(opcoesEscolhidas).forEach(itens => {
        itens.forEach(item => { totalAdicional += item.preco_adicional })
    })

    const precoUnitario = produtoOpcoesAtual.preco + totalAdicional
    const totalFinal = precoUnitario * quantidadeOpcoesAtual

    document.getElementById("options-total").textContent =
        totalFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function gruposObrigatoriosCompletos() {
    return produtoOpcoesAtual.opcoes.every(grupo => {
        if (!grupo.obrigatorio) return true
        return opcoesEscolhidas[grupo.nome].length >= grupo.min
    })
}

function fecharModalOpcoes() {
    document.getElementById("options-modal").classList.remove("open")
    document.body.style.overflow = ""
    if (history.state && history.state.opcoesModalAberto) {
        history.back()
    }
}

function fecharModalOpcoesSeOverlay(event) {
    if (event.target === document.getElementById("options-modal")) {
        fecharModalOpcoes()
    }
}

document.getElementById("options-close-btn").addEventListener("click", fecharModalOpcoes)

document.getElementById("options-confirm-btn").addEventListener("click", () => {
    if (!gruposObrigatoriosCompletos()) {
        Toastify({
            text: "Escolha as opções obrigatórias antes de continuar.",
            duration: 2000,
            gravity: "top",
            position: "right",
            style: { background: "#ef4444", borderRadius: "8px" },
        }).showToast()
        return
    }

    const todasOpcoes = Object.values(opcoesEscolhidas).flat()
    addToCart(produtoOpcoesAtual.id, produtoOpcoesAtual.nome, produtoOpcoesAtual.preco, null, quantidadeOpcoesAtual, todasOpcoes)
    fecharModalOpcoes()
})

window.addEventListener("popstate", () => {
    const modalOpcoes = document.getElementById("options-modal")
    const modalProduto = document.getElementById("product-modal")
    const modalCarrinho = document.getElementById("cart-modal")

    if (modalOpcoes.classList.contains("open")) {
        fecharModalOpcoes()
    } else if (modalProduto.classList.contains("open")) {
        fecharModalProduto()
    } else if (modalCarrinho.style.display === "flex") {
        fecharModalCarrinho()
    }
})


// ===========================
// INICIALIZAÇÃO
// (espera o supabase-loader.js avisar que os dados chegaram,
// em vez de rodar direto — porque agora os dados vêm de uma
// busca no banco, que é assíncrona)
// ===========================
document.addEventListener("dadosDaLojaProntos", () => {
    aplicarDadosDaLoja()
    aplicarModoMesa()
    renderizarProdutos()
    aplicarStatusLoja()
})


// ===========================
// BOTÃO VOLTAR AO TOPO
// Aparece depois que o usuário rola a página pra baixo.
// ===========================
const topoBtn = document.getElementById("topo-btn")

window.addEventListener("scroll", function () {
    if (window.scrollY > 400) {
        topoBtn.classList.add("visivel")
    } else {
        topoBtn.classList.remove("visivel")
    }
})

topoBtn.addEventListener("click", function () {
    scrollSuavePara(0)
})