# X‑Clone Frontend

## 🎯 Visão geral  
`x-clone-frontend` é a interface web do clone do app X. Utiliza React, TypeScript, Tailwind, para consumir a API do backend e exibir a experiência de uma rede social: feed de posts, perfil de usuário, autenticação, seguidores/seguindo, likes/comentários etc.  

Este frontend consome a API disponibilizada pelo backend (por exemplo, o repositório [x-clone-backend](https://github.com/franciscolucas686/x-clone-backend) e implementa toda interação com o usuário, formulários, rotas, interface responsiva, etc.

## 🛠 Tecnologias e Estado

- **React** com **TypeScript**
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Redux Toolkit** para gerenciamento de estado global:
  - **Slices** para organizar o estado por domínio (ex: `authSlice`, `postsSlice`)
  - **Thunks** para lidar com chamadas assíncronas à API (ex: `fetchPosts`, `loginUser`)
- **Axios** para requisições HTTP 

## 📥 Como rodar localmente  

1. Clone o repositório:  
```bash
git clone https://github.com/franciscolucas686/x-clone-frontend.git
cd x-clone-frontend
 ```

2. Instale as dependencias:
```bash
npm install
```
ou, se usar yarn
```bash
yarn
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
ou, se usar yarn
```bash
yarn run dev
```

4. Abra o navegador em [http://localhost:3000](http://localhost:3000) para ver a aplicação rodando localmente.

⚠️ **Certifique‑se de que o backend esteja rodando e acessível** — o frontend depende das rotas da API para funcionar corretamente.

---

## 🔧 Configurações (API / Variáveis de ambiente)

Se a sua aplicação front exige alguma variável de ambiente (ex: URL base da API), explique aqui. Por exemplo:

```bash
VITE_API_URL=http://localhost:8000/api
```

Ou o que for aplicável — adapte conforme sua configuração.

---

## ✅ Objetivo / Funcionalidades principais

A interface permite ao usuário:

- Autenticar / Registrar usuário
- Ver e editar perfil (incluindo avatar)
- Ver feed de posts
- Criar novos posts (texto)
- Curtir posts, fazer comentários
- Seguir / deixar de seguir outros usuários
- Ver lista de seguidores / seguindo
- Ver perfil de outros usuários e seus posts

Essas funcionalidades simulam de forma próxima uma rede social real, consumindo a API do backend de forma modular.

---

## 📚 Observações

- Este frontend depende de um backend funcional — sem a API o frontend não vai carregar dados úteis.  
- Recomenda-se usar um arquivo `.env` com variáveis mínimas para configuração da API e outras settings.  
- Código estruturado de forma modular, com componentes reutilizáveis.



