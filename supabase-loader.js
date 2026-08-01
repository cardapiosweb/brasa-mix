// ============================================================
// SUPABASE LOADER
// Substitui dados-loja.js e dados-produtos.js.
// Busca os dados da loja (pelo slug configurado abaixo) e monta
// as MESMAS variáveis globais que script.js já espera: `loja`,
// `produtos` e `categorias`. Assim o script.js não precisa mudar
// quase nada — só o final, que espera este loader terminar.
// ============================================================

// >>> ÚNICA COISA QUE MUDA DE UM CLIENTE PRO OUTRO NESTE ARQUIVO <<<
const LOJA_SLUG = "brasa-mix"

// Config do projeto Supabase (igual pra todos os clientes,
// é o mesmo projeto/banco compartilhado)
const SUPABASE_URL = "https://bjnnkeutfilbzdhbqqij.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqbm5rZXV0ZmlsYnpkaGJxcWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTU0MzIsImV4cCI6MjA5OTM3MTQzMn0.kyj-JDRj4YAwlgGze56MGsd9UjezpF1PeG-HpJnm3_I"

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Variáveis globais que script.js consome (mesmos nomes de antes)
let loja = {}
let produtos = []
let categorias = {}

async function carregarDadosDaLoja() {
    // 1) Busca a loja pelo slug
    const { data: lojaDb, error: erroLoja } = await supabaseClient
        .from("lojas")
        .select("*")
        .eq("slug", LOJA_SLUG)
        .single()

    if (erroLoja || !lojaDb) {
        document.body.innerHTML =
            "<p style='padding:40px;font-family:sans-serif'>Não foi possível carregar esta loja. Verifique o slug configurado.</p>"
        console.error(erroLoja)
        return
    }

    // Loja desativada no painel admin ("Loja ativa" = Não): não renderiza
    // o cardápio, mostra um aviso simples em vez disso.
    if (lojaDb.ativa === false) {
        document.body.innerHTML =
            "<p style='padding:40px;font-family:sans-serif;text-align:center'>Loja fechada no momento. Volte mais tarde!</p>"
        return
    }

    // 2) Traduz os nomes de coluna do banco pros nomes que
    // script.js já espera (mesma "forma" do antigo dados-loja.js)
    loja = {
        id: lojaDb.id, // usado para gravar pedidos do modo mesa (pedidos_mesa)
        nome: lojaDb.nome,
        tagline: lojaDb.tagline,
        endereco: lojaDb.endereco,
        whatsapp: lojaDb.whatsapp,
        logo: lojaDb.logo_url,
        banner: lojaDb.banner_url,
        corPrincipal: lojaDb.cor_principal,
        corPrincipalEscura: lojaDb.cor_principal_escura,
        corPrincipalClara: lojaDb.cor_principal_clara,
        tituloSecaoMenu: lojaDb.titulo_secao_menu,
        textoHorario: lojaDb.texto_horario,
        chavePix: lojaDb.chave_pix,
        horario: lojaDb.horario || {}
    }

    // 3) Monta `categorias` no mesmo formato de objeto que script.js
    // espera, respeitando a ordem (campo "ordem")
    categorias = {}
    ;(lojaDb.categorias || [])
        .sort((a, b) => a.ordem - b.ordem)
        .forEach(c => {
            categorias[c.nome] = { icone: c.icone }
        })

    // 4) Busca os produtos dessa loja
    const { data: produtosDb, error: erroProdutos } = await supabaseClient
        .from("produtos")
        .select("*")
        .eq("loja_id", lojaDb.id)
        .order("ordem", { ascending: true })

    if (erroProdutos) {
        console.error(erroProdutos)
    }

    produtos = (produtosDb || []).map(p => ({
        id: p.id,
        categoria: p.categoria,
        nome: p.nome,
        desc: p.descricao,
        preco: Number(p.preco),
        fotos: p.fotos && p.fotos.length ? p.fotos : ["https://placehold.co/400x300?text=Sem+foto"],
        oferta: p.oferta,
        esgotado: p.esgotado,
        estoque: p.estoque,
        retirada_apenas: p.retirada_apenas,
        esconder_setas: p.esconder_setas,
        esconder_observacao: p.esconder_observacao,
        icone: p.icone || undefined,
        opcoes: p.opcoes || null
    }))

    // 5) Avisa o script.js que os dados chegaram
    document.dispatchEvent(new Event("dadosDaLojaProntos"))
}

carregarDadosDaLoja()