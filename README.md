# x-clone — frontend

Interface de uma rede social no estilo do X (Twitter). **React 19 + TypeScript + Redux
Toolkit + Tailwind 4**, com Vite. Cadastro/login, feed, publicar, curtir, comentar,
seguir, perfil próprio e público, busca de usuários e edição de perfil com foto — tudo
consumindo uma API própria em Django.

Repositório irmão: consome a API de
[`x-clone-backend`](https://github.com/franciscolucas686/x-clone-backend) (Django +
DRF + PostgreSQL).

**Stack:** React 19 · TypeScript · Vite 7 · Redux Toolkit · React Router 7 · Tailwind
CSS 4 · react-hook-form + Zod · axios · Vitest + Testing Library + MSW

---

## O que funciona de verdade

Cadastro, login, feed, publicar, curtir, comentar, seguir, perfil próprio e público,
listas de seguidores/seguindo, busca de usuários, edição de perfil com foto — e a foto
nova aparece na hora em toda a interface, sem precisar recarregar a página.

**São maquetes estáticas**, sem backend por trás: a página de Mensagens e o modal de
nova mensagem, a página de Notificações, o painel de planos (`PremiumPanel`) e os
assuntos do momento na barra lateral. Estão aqui porque completam o visual do clone;
nenhuma delas finge ter dados reais.

---

## Como rodar localmente (a partir do `git clone`)

Pré-requisitos: **Node 22** (há um `.nvmrc`) e o
[`x-clone-backend`](https://github.com/franciscolucas686/x-clone-backend) rodando em
`localhost:8000` — suba-o primeiro seguindo o README de lá.

```bash
git clone https://github.com/franciscolucas686/x-clone-frontend.git
cd x-clone-frontend

cp .env.example .env   # o valor já aponta para o backend local
npm install
npm run dev
```

O app sobe em `http://localhost:5173`. Cadastre um usuário pela própria tela — não há
conta fixa: o backend, em produção, zera o banco a cada deploy (ver README dele).

---

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção — inclui `tsc -b`, então não há como publicar com erro de tipo |
| `npm test` | Suíte de testes |
| `npm run test:watch` | Testes em watch |
| `npm run typecheck` | Só a checagem de tipos |
| `npm run lint` | ESLint, sem corrigir — é o que o CI roda |
| `npm run lint:fix` | ESLint corrigindo e formatando |
| `npm run format:check` | Verifica a formatação |

Os mesmos verbos do backend, de propósito: os dois repositórios são operados igual.

---

## Estrutura

```
src/
├── shared/          Transversal, sem domínio
│   ├── api/         api-client, api-error, error-code-map, types, auth-storage
│   ├── paginated-list.ts
│   └── config.ts
├── ui/              Design system. Zero domínio, zero rede, zero rota.
├── layouts/         Estrutura da página; o conteúdo chega pelo Outlet
├── features/        Uma pasta por domínio, dona do próprio transporte e estado
│   └── <dominio>/
│       ├── api/<dominio>-service.ts   fala HTTP e mais nada
│       ├── <dominio>.schema.ts        regras de formulário (Zod)
│       ├── <dominio>Slice.ts          estado
│       ├── <dominio>Thunks.ts         orquestração
│       ├── hooks/  components/
├── pages/           Telas — só composição
└── routes/          Roteador e guardas
```

**A direção de dependência é `ui → layouts → features → pages → routes`**, e ela é
verificada pelo ESLint (`eslint.config.js`), não descrita num documento. Tentar importar
um tipo da API dentro de `ui/` dá erro de lint com a explicação do porquê:

```
error  '@/shared/api/types' import is restricted from being used by a pattern.
       ui/ é o design system: não pode conhecer domínio, rede nem rota. Receba tudo por
       props — se o componente precisa de um tipo da API, ele pertence a features/.
```

Isso depende do alias `@/`: as regras casam por especificador de import, e um `../../ui`
escaparia delas. Por isso imports relativos entre pastas também são erro de lint. O alias
está configurado em três lugares que precisam concordar: `tsconfig.app.json`,
`vite.config.ts` e `vitest.config.ts`.

---

## Estado e dados

**Transporte é separado de estado.** `features/<dominio>/api/*-service.ts` são funções
que falam HTTP — sem React, sem Redux, sem cache. Os thunks chamam o service, traduzem o
erro e devolvem ao reducer. Dá para testar a camada de rede sem montar um store, e trocar
um endpoint sem entrar num reducer.

Listas paginadas usam `shared/paginated-list.ts`: uma forma só (`items`, `next`, `count`,
`loading`, `error`) e um `applyPage` que deduplica por id, em vez da mesma quíntupla
repetida em cada slice com nomes diferentes.

Não há cache normalizado único (sem React Query, sem entidades globais): cada slice
guarda a própria cópia dos dados que precisa. Onde isso importa — o avatar do usuário
logado, por exemplo, aparece em `auth`, `users` e `posts` ao mesmo tempo — as slices
reagem umas às outras (`userSlice.ts` e `postSlice.ts` escutam `updateProfile.fulfilled`
de `authThunks`) em vez de cada tela lembrar de sincronizar sozinha.

---

## Erros

Toda falha de rede chega como o envelope da API, com um `code` estável, **já em
português** (backend e frontend). `shared/api/error-code-map.ts` mapeia código → texto,
e `getErrorMessage` resolve nesta ordem: código conhecido → mensagem do servidor → texto
genérico.

O cliente **nunca lê a frase do servidor para decidir o que mostrar**. A versão anterior
procurava substrings em inglês (`"too short"`, `"already exists"`) dentro do texto gerado
pelo Django; atualizar o Django bastava para o usuário ver a mensagem crua em inglês.

O `api-client` também não navega: um 401 fora das rotas de credencial dispara
`sessionExpired()`, e quem redireciona é o `PrivateRoute`, reagindo ao estado.

---

## Formulários

Zod + `react-hook-form`. Os schemas ficam em `features/<dominio>/*.schema.ts` e
**espelham as regras que o backend já aplica**, citando o arquivo de origem — não são
regras inventadas no cliente. Quando as regras do backend mudarem, o schema muda no mesmo
commit. A capitalização do campo "nome" (maiúscula por palavra, exceto conectivos como
"de"/"da"/"dos") é normalizada só no backend — o frontend mostra o valor que voltou na
resposta, sem duplicar a regra.

---

## Testes

```bash
npm test
```

Vitest + Testing Library + MSW. As chamadas de rede são interceptadas na fronteira, nunca
com mock de módulo: um refactor que preserve o comportamento não mexe nos testes.
`src/mocks/handlers.ts` é um servidor em memória — pagina, alterna curtida, alterna
seguir — porque o que vale testar é a interação entre essas coisas, não um payload fixo.

Uma requisição não declarada em `handlers.ts` **falha o teste**
(`onUnhandledRequest: "error"`), o que mantém o arquivo sendo um inventário completo da
superfície de rede do app.

Os elementos são consultados por papel e nome acessível — `getByRole("button", { name:
"Curtir" })`, `getByLabelText("Senha")` — nunca por posição ou placeholder. Reordenar um
campo não deve reapontar uma asserção em silêncio.

---

## Ambiente

Uma variável obrigatória, `VITE_API_URL`, documentada em `.env.example`. `vite-env.d.ts`
declara `ImportMetaEnv`, então um erro de digitação no nome não compila.

**Ela é embutida no bundle em tempo de build.** Definir o valor no painel do host depois
do build não tem efeito nenhum: ele já está dentro do JavaScript gerado. Trocar a URL da
API exige **rebuild**, não restart.

## Deploy

`vercel.json` fixa o rewrite que devolve `index.html` para qualquer caminho que não seja
um arquivo de build. Sem ele, abrir `/feed` direto ou dar F5 nessa rota devolveria 404 —
o caminho existe só dentro do JavaScript. Ver [`VERCEL.md`](./VERCEL.md) para o detalhe.
