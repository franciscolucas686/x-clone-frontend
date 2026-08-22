# Por que este `vercel.json` existe

O app tem rotas de cliente — `/feed`, `/profile`, `/user/:username`,
`/follow/:username/followers`. Elas só existem dentro do JavaScript: o servidor não tem
arquivo nenhum nesses caminhos.

Abrir uma delas direto, ou dar F5 estando nela, faz o navegador pedir o caminho ao host.
Sem o rewrite, o host procura `/feed` no disco, não acha, e devolve **404** — a URL que o
usuário copiou e mandou para alguém não abre.

O `rewrites` manda todo caminho que não seja um arquivo de build (`/assets/...`) devolver
o `index.html`, e o React Router resolve a rota a partir dali.

O preset Vite da Vercel já faz isso sozinho hoje. O arquivo existe para que o
comportamento seja do repositório e não do painel: se o projeto for reimportado, mudar de
preset, ou for para outro host, a regra vai junto.
