import { z } from "zod";

/**
 * Regras dos formulários de conta.
 *
 * Espelham o que o backend **já** aplica, e citam a fonte. Não são regras inventadas no
 * cliente: uma regra que vive só de um lado é pior que regra nenhuma, porque passa a
 * impressão de que o dado está garantido quando qualquer chamada direta à API a contorna.
 *
 * Fontes no backend:
 * - `username`: `UnicodeUsernameValidator` + `max_length=150` em
 *   `accounts/serializers.py`, e a unicidade em `validate_username` (código
 *   USERNAME_ALREADY_EXISTS, que só o servidor pode verificar).
 * - `password`: `AUTH_PASSWORD_VALIDATORS` em `backend/settings/base.py` —
 *   MinimumLength (8), CommonPassword, NumericPassword e UserAttributeSimilarity. As
 *   duas primeiras dão para checar aqui; as outras duas dependem de dados que só o
 *   servidor tem, e chegam como erro de validação.
 * - a igualdade de senhas: `validate()` do serializer (código PASSWORD_MISMATCH).
 *
 * Quando as regras do backend mudarem, este arquivo muda no mesmo commit.
 */

const username = z
  .string()
  .min(1, "Informe o nome de usuário.")
  .max(150, "No máximo 150 caracteres.")
  // Mesmo conjunto do UnicodeUsernameValidator do Django: letras, dígitos e @ . + - _
  .regex(/^[\w.@+-]+$/u, "Use apenas letras, números e os símbolos . @ + - _");

const password = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .refine((v) => !/^\d+$/.test(v), "A senha não pode ser só números.");

export const loginSchema = z.object({
  username: z.string().min(1, "Informe o nome de usuário."),
  // No login não se valida força: quem já tem conta pode ter uma senha criada sob outras
  // regras, e recusá-la aqui esconderia o motivo real do erro.
  password: z.string().min(1, "Informe a senha."),
});

export const registerSchema = z
  .object({
    username,
    name: z.string().max(150, "No máximo 150 caracteres.").optional().or(z.literal("")),
    password,
    confirmPassword: z.string().min(1, "Confirme a senha."),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const editProfileSchema = z
  .object({
    username,
    name: z.string().max(150, "No máximo 150 caracteres."),
    // Vazio significa "não trocar a senha" — é assim que o formulário expressa a
    // ausência, e por isso nenhum refinamento pode recusá-lo.
    password: z.union([z.literal(""), password]),
    confirmPassword: z.string(),
  })
  .refine((dados) => !dados.password || dados.password === dados.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
