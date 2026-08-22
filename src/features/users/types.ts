// Mantido como reexportação: os contratos de fio vivem em shared/api/types.ts.
import type { User } from "@/shared/api/types";

export type { PaginatedResponse as PaginatedUsersResponse, User } from "@/shared/api/types";

/** Formato do estado do slice — não é contrato de API, e por isso não vive junto deles. */
export interface UsersState {
  selectedUser: User | null;
  list: User[];
  loading: boolean;
  error: string | null;
  followers: User[];
  following: User[];
  followersNext: string | null;
  followingNext: string | null;
  hasMoreFollowers: boolean;
  hasMoreFollowing: boolean;
  loadingFollowers: boolean;
  loadingFollowing: boolean;
  loadingFollowIds: number[];
}
