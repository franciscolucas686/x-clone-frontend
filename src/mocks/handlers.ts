import { HttpResponse, http } from "msw";
import type { Post, PostComment } from "@/features/posts/types";
import type { User } from "@/features/users/types";
import type { ApiErrorResponse } from "@/shared/api/types";

/**
 * Servidor em memória por trás dos handlers.
 *
 * A paginação, o toggle de curtida e o toggle de seguir são implementados aqui em vez de
 * devolvidos como payload fixo, porque o comportamento que vale testar *é* a interação
 * entre eles: que "ver mais" acrescenta sem substituir, que curtir alterna, que seguir
 * reflete na lista. Um payload fixo passaria em todos esses testes sem exercitar nada.
 */
const API = "http://localhost:8000/api/v1";
const PAGE_SIZE = 10;

let users: User[] = [];
let posts: Post[] = [];
let comments: PostComment[] = [];
let currentUser: User | null = null;

export function makeUser(overrides: Partial<User> = {}): User {
  const id = overrides.id ?? users.length + 1;
  return {
    id,
    username: `user${id}`,
    name: `Usuário ${id}`,
    avatar_url: `https://exemplo.test/avatar/${id}.png`,
    joined_display: "01/01/2025",
    followers_count: 0,
    following_count: 0,
    is_following: false,
    posts_count: 0,
    ...overrides,
  };
}

export function makePost(overrides: Partial<Post> = {}): Post {
  const id = overrides.id ?? posts.length + 1;
  return {
    id,
    user: overrides.user ?? makeUser(),
    text: `Post ${id}`,
    created_at: "2025-01-01T12:00:00Z",
    likes_count: 0,
    comments_count: 0,
    is_liked: false,
    ...overrides,
  };
}

export function setMockUsers(next: User[]) {
  users = next;
}

export function setMockPosts(next: Post[]) {
  posts = next;
}

export function setCurrentUser(next: User | null) {
  currentUser = next;
}

export function setMockComments(next: PostComment[]) {
  comments = next;
}

export function resetMockData() {
  users = [];
  posts = [];
  comments = [];
  currentUser = null;
}

/** Envelope de paginação do DRF, que é o que o frontend desempacota. */
function paginate<T>(items: T[], url: URL, path: string) {
  const page = Number(url.searchParams.get("page") ?? "1");
  const start = (page - 1) * PAGE_SIZE;
  const slice = items.slice(start, start + PAGE_SIZE);
  const hasNext = start + PAGE_SIZE < items.length;
  return {
    count: items.length,
    next: hasNext ? `${API}${path}?page=${page + 1}` : null,
    previous: page > 1 ? `${API}${path}?page=${page - 1}` : null,
    results: slice,
  };
}

/** Reproduz o envelope real de erro. Ver common/exception_handler.py. */
function erro(
  code: string,
  status: number,
  message: string,
  details: ApiErrorResponse["details"] = null,
) {
  const body: ApiErrorResponse = { code, message, details, status_code: status, path: "" };
  return HttpResponse.json(body, { status });
}

function unauthorized() {
  return erro("AUTHENTICATION_REQUIRED", 401, "Entre na sua conta para continuar.");
}

export const handlers = [
  http.post(`${API}/token/`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    const found = users.find((u) => u.username === body.username);
    if (!found || body.password === "senha-errada") {
      // O backend traduz o "no_active_account" do simplejwt para este code, e é por ele
      // — não pela frase — que o frontend decide a mensagem.
      return erro("INVALID_CREDENTIALS", 401, "Usuário ou senha incorretos.");
    }
    currentUser = found;
    return HttpResponse.json({ access: "token-de-teste", refresh: "" });
  }),

  http.post(`${API}/register/`, async ({ request }) => {
    const body = (await request.json()) as { username: string; name: string };
    if (users.some((u) => u.username === body.username)) {
      return erro("USERNAME_ALREADY_EXISTS", 409, "Esse nome de usuário já está em uso.", {
        username: ["Esse nome de usuário já está em uso."],
      });
    }
    const created = makeUser({ id: users.length + 1, username: body.username, name: body.name });
    users = [...users, created];
    currentUser = created;
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get(`${API}/profile/`, () =>
    currentUser ? HttpResponse.json(currentUser) : unauthorized(),
  ),

  http.patch(`${API}/profile/`, async ({ request }) => {
    if (!currentUser) return unauthorized();
    const form = await request.formData();
    const name = form.get("name");
    if (typeof name === "string") currentUser = { ...currentUser, name };
    return HttpResponse.json(currentUser);
  }),

  http.get(`${API}/users/`, ({ request }) =>
    HttpResponse.json(paginate(users, new URL(request.url), "/users/")),
  ),

  http.get(`${API}/users/:username/`, ({ params }) => {
    const found = users.find((u) => u.username === params.username);
    return found
      ? HttpResponse.json(found)
      : erro("USER_NOT_FOUND", 404, "Usuário não encontrado.");
  }),

  http.get(`${API}/posts/following/`, ({ request }) =>
    HttpResponse.json(paginate(posts, new URL(request.url), "/posts/following/")),
  ),

  http.get(`${API}/users/:username/posts/`, ({ request, params }) => {
    const doUsuario = posts.filter((p) => p.user.username === params.username);
    return HttpResponse.json(
      paginate(doUsuario, new URL(request.url), `/users/${params.username}/posts/`),
    );
  }),

  http.post(`${API}/posts/`, async ({ request }) => {
    if (!currentUser) return unauthorized();
    const body = (await request.json()) as { text: string };
    const created = makePost({ id: posts.length + 1, user: currentUser, text: body.text });
    posts = [created, ...posts];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post(`${API}/posts/:id/like/`, ({ params }) => {
    const id = Number(params.id);
    const alvo = posts.find((p) => p.id === id);
    if (!alvo) return erro("POST_NOT_FOUND", 404, "Esse post não existe mais.");
    const curtido = !alvo.is_liked;
    const atualizado = {
      ...alvo,
      is_liked: curtido,
      likes_count: alvo.likes_count + (curtido ? 1 : -1),
    };
    posts = posts.map((p) => (p.id === id ? atualizado : p));
    // O servidor devolve o post inteiro. Antes devolvia
    // {"message": "Curtido"|"Descurtido", "post": {...}} e o cliente comparava a string.
    return HttpResponse.json(atualizado);
  }),

  http.get(`${API}/posts/:id/comments/`, ({ request, params }) => {
    const doPost = comments.filter((c) => c.post === Number(params.id));
    return HttpResponse.json(
      paginate(doPost, new URL(request.url), `/posts/${params.id}/comments/`),
    );
  }),

  http.post(`${API}/posts/:id/comments/`, async ({ request, params }) => {
    if (!currentUser) return unauthorized();
    const body = (await request.json()) as { text: string };
    const comentario: PostComment = {
      id: comments.length + 1,
      user: currentUser,
      post: Number(params.id),
      text: body.text,
      created_at: "2025-01-01T12:00:00Z",
    };
    comments = [comentario, ...comments];
    return HttpResponse.json(comentario, { status: 201 });
  }),

  http.post(`${API}/follow/:userId/toggle/`, ({ params }) => {
    const id = Number(params.userId);
    const alvo = users.find((u) => u.id === id);
    if (!alvo) return erro("USER_NOT_FOUND", 404, "Usuário não encontrado.");
    const seguindo = !alvo.is_following;
    users = users.map((u) =>
      u.id === id
        ? { ...u, is_following: seguindo, followers_count: u.followers_count + (seguindo ? 1 : -1) }
        : u,
    );
    const alvoAtualizado = users.find((u) => u.id === id)!;
    return seguindo
      ? HttpResponse.json(
          { is_following: true, followers_count: alvoAtualizado.followers_count },
          { status: 201 },
        )
      : HttpResponse.json({ is_following: false, followers_count: alvoAtualizado.followers_count });
  }),

  http.get(`${API}/follow/:userId/followers/`, ({ request }) =>
    HttpResponse.json(paginate(users, new URL(request.url), "/follow/1/followers/")),
  ),

  http.get(`${API}/follow/:userId/following/`, ({ request }) =>
    HttpResponse.json(paginate(users, new URL(request.url), "/follow/1/following/")),
  ),
];
