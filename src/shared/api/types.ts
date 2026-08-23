/**
 * Contratos de fio da API. Um módulo só, espelhando os serializers do backend.
 *
 * Os tipos ficavam espalhados em `features/<dominio>/types.ts`, misturados com o formato do
 * estado do Redux — que é outra coisa: um é o que o servidor manda, o outro é como o
 * cliente guarda. E `PaginatedResponse<T>` convivia com um `PaginatedUsersResponse`
 * idêntico campo a campo.
 */

/** Envelope único de erro. Ver common/exception_handler.py. */
export interface ApiErrorResponse {
  /** Identificador estável. É o contrato — nunca ramifique pela `message`. */
  code: string;
  message: string;
  /** Erros por campo, quando houver, para o formulário destacar o campo certo. */
  details: Record<string, string[]> | null;
  status_code: number;
  path: string;
}

/** Envelope de paginação do DRF. */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Autor de um post ou comentário — os quatro campos de `UserFeedSerializer`.
 *
 * Distinto de `User` de propósito. `Post.user` era tipado como o `User` completo, de
 * nove campos, enquanto o backend aninha `UserFeedSerializer`, que devolve quatro:
 * `post.user.followers_count` era `undefined` em runtime e não-opcional no tipo. Não
 * quebrava só porque nenhum componente usava esses campos — o tipo simplesmente mentia,
 * e o TypeScript não tinha como perceber, porque `api.get<T>` é asserção e não
 * verificação.
 */
export interface FeedUser {
  id: number;
  username: string;
  /** Vazio, nunca nulo: o campo é `blank=True` sem `null=True` no modelo. */
  name: string;
  avatar_url: string;
}

/** Perfil completo — `UserProfileSerializer`. */
export interface User extends FeedUser {
  joined_display: string;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  posts_count: number;
  /** `true` quando a pessoa já escolheu uma foto — nunca deduzido comparando URL contra
   * um avatar padrão, porque essa comparação exigia o cliente conhecer a URL padrão. */
  has_custom_avatar: boolean;
}

/** Post como vem numa listagem — `PostSerializer`. */
export interface Post {
  id: number;
  user: FeedUser;
  text: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  // `comments` não existe mais aqui. Vinham aninhados, completos e sem limite, em todo
  // post do feed. Hoje têm endpoint próprio e paginado: GET /posts/<id>/comments/.
}

/** Comentário — `CommentSerializer`. */
export interface PostComment {
  id: number;
  user: FeedUser;
  post: number;
  text: string;
  created_at: string;
}

/** Resposta de POST /follow/<id>/toggle/. */
export interface FollowToggleResponse {
  is_following: boolean;
  followers_count: number;
}

/** Resposta de POST /token/ e de POST /token/refresh/. */
export interface TokenResponse {
  access: string;
  refresh: string;
}

/** Resposta de POST /register/. */
export interface RegisterResponse extends User {
  /** Par de tokens do usuário recém-criado. Evita a segunda ida a /token/ que o cadastro
   * fazia — e o segundo hash de senha que ela custava. */
  tokens: TokenResponse;
}
