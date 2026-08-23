import { describe, expect, it } from "vitest";
import { updateProfile } from "@/features/auth/authThunks";
import postReducer, { initialState, type PostState } from "@/features/posts/postSlice";
import type { FeedUser, Post, PostComment, User } from "@/shared/api/types";

function autor(overrides: Partial<FeedUser> = {}): FeedUser {
  return {
    id: 1,
    username: "francisco",
    name: "Francisco",
    avatar_url: "https://exemplo.test/antigo.png",
    ...overrides,
  };
}

function usuario(overrides: Partial<User> = {}): User {
  return {
    ...autor(),
    joined_display: "01/01/2026",
    followers_count: 0,
    following_count: 0,
    is_following: false,
    posts_count: 0,
    has_custom_avatar: false,
    ...overrides,
  };
}

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: 10,
    user: autor(),
    text: "olá",
    created_at: "2026-01-01T00:00:00Z",
    likes_count: 0,
    comments_count: 0,
    is_liked: false,
    ...overrides,
  };
}

function comentario(overrides: Partial<PostComment> = {}): PostComment {
  return {
    id: 100,
    user: autor(),
    post: 10,
    text: "bom post",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("postSlice — sincronização de avatar após updateProfile", () => {
  it("atualiza o autor no feed, na timeline do perfil e nos comentários já carregados", () => {
    const state: PostState = {
      ...initialState,
      feed: { ...initialState.feed, items: [post({ id: 10 })] },
      userPosts: { ...initialState.userPosts, items: [post({ id: 11 })] },
      comments: {
        10: { ...initialState.feed, items: [comentario({ id: 100 })] },
      },
    };

    const action = updateProfile.fulfilled(
      usuario({ avatar_url: "https://exemplo.test/novo.png", name: "Francisco Lucas" }),
      "requestId",
      {} as never,
    );

    const proximo = postReducer(state, action);

    expect(proximo.feed.items[0].user.avatar_url).toBe("https://exemplo.test/novo.png");
    expect(proximo.userPosts.items[0].user.avatar_url).toBe("https://exemplo.test/novo.png");
    expect(proximo.comments[10].items[0].user.avatar_url).toBe("https://exemplo.test/novo.png");
    expect(proximo.feed.items[0].user.name).toBe("Francisco Lucas");
  });

  it("não altera posts/comentários de outro autor", () => {
    const state: PostState = {
      ...initialState,
      feed: { ...initialState.feed, items: [post({ id: 20, user: autor({ id: 2 }) })] },
    };

    const action = updateProfile.fulfilled(
      usuario({ id: 1, avatar_url: "https://exemplo.test/novo.png" }),
      "requestId",
      {} as never,
    );

    const proximo = postReducer(state, action);

    expect(proximo.feed.items[0].user.avatar_url).toBe("https://exemplo.test/antigo.png");
  });
});
