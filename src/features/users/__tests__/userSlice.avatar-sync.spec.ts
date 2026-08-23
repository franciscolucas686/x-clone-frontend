import { describe, expect, it } from "vitest";
import { updateProfile } from "@/features/auth/authThunks";
import userReducer, { type UsersState } from "@/features/users/userSlice";
import { emptyList } from "@/shared/paginated-list";
import type { User } from "@/shared/api/types";

function usuario(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: "francisco",
    name: "Francisco",
    avatar_url: "https://exemplo.test/antigo.png",
    joined_display: "01/01/2026",
    followers_count: 0,
    following_count: 0,
    is_following: false,
    posts_count: 0,
    has_custom_avatar: false,
    ...overrides,
  };
}

describe("userSlice — sincronização de avatar após updateProfile", () => {
  it("atualiza o avatar no perfil selecionado, na lista, em seguidores e em seguindo", () => {
    const antigo = usuario();
    const state: UsersState = {
      selectedUser: usuario(),
      loadingSelectedUser: false,
      selectedUserError: null,
      list: { ...emptyList<User>(), items: [usuario()] },
      followers: { ...emptyList<User>(), items: [usuario()] },
      following: { ...emptyList<User>(), items: [usuario()] },
      loadingFollowIds: [],
    };

    const novoUsuario = usuario({
      avatar_url: "https://exemplo.test/novo.png",
      name: "Francisco Lucas",
    });
    const action = updateProfile.fulfilled(novoUsuario, "requestId", {} as never);

    const proximo = userReducer(state, action);

    expect(proximo.selectedUser?.avatar_url).toBe("https://exemplo.test/novo.png");
    expect(proximo.list.items[0].avatar_url).toBe("https://exemplo.test/novo.png");
    expect(proximo.followers.items[0].avatar_url).toBe("https://exemplo.test/novo.png");
    expect(proximo.following.items[0].avatar_url).toBe("https://exemplo.test/novo.png");
    expect(proximo.list.items[0].name).toBe("Francisco Lucas");
    // Referência original não é usada como fonte após o dispatch — só o estado do slice importa.
    expect(antigo.avatar_url).toBe("https://exemplo.test/antigo.png");
  });

  it("não altera usuários com id diferente", () => {
    const state: UsersState = {
      selectedUser: usuario({ id: 2 }),
      loadingSelectedUser: false,
      selectedUserError: null,
      list: emptyList<User>(),
      followers: emptyList<User>(),
      following: emptyList<User>(),
      loadingFollowIds: [],
    };

    const action = updateProfile.fulfilled(
      usuario({ id: 1, avatar_url: "https://exemplo.test/novo.png" }),
      "requestId",
      {} as never,
    );

    const proximo = userReducer(state, action);

    expect(proximo.selectedUser?.avatar_url).toBe("https://exemplo.test/antigo.png");
  });
});
