// Mensagens em português por `code` estável vindo do backend.
//
// Substitui o `translateError()`, que procurava **substrings em inglês** dentro do texto
// gerado pelo Django — `"too short"`, `"already exists"`, `"No active account found"`.
// Aquilo acoplava a interface à prosa interna do framework: atualizar o Django, mudar
// LANGUAGE_CODE para pt-br ou trocar um validador de senha fazia o `.includes()` parar de
// casar, e o usuário via a frase crua em inglês no meio do cadastro. Nenhum teste e
// nenhum type-check pegavam isso.
//
// Um code ausente daqui cai no passthrough de `getErrorMessage` — ver api-error.ts.
// Cada chave corresponde a uma classe em common/errors.py, ou a um code que o
// exception_handler sintetiza para exceções do próprio DRF.
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Usuário ou senha incorretos.",
  USERNAME_ALREADY_EXISTS: "Esse nome de usuário já está em uso.",
  PASSWORD_MISMATCH: "As senhas não coincidem.",
  USER_NOT_FOUND: "Usuário não encontrado.",

  POST_NOT_FOUND: "Esse post não existe mais.",
  CANNOT_FOLLOW_SELF: "Você não pode seguir a si mesmo.",

  STORAGE_NOT_CONFIGURED: "O envio de imagens está indisponível no momento.",
  AVATAR_UPLOAD_FAILED: "Não foi possível enviar a imagem agora. Tente novamente.",
  UNSUPPORTED_MEDIA_TYPE: "Formato não suportado. Envie uma imagem JPG, PNG ou WEBP.",
  FILE_TOO_LARGE: "A imagem é grande demais.",

  TOKEN_NOT_VALID: "Sua sessão expirou. Entre novamente.",
  AUTHENTICATION_REQUIRED: "Entre na sua conta para continuar.",
  AUTHENTICATION_FAILED: "Não foi possível autenticar. Entre novamente.",
  PERMISSION_DENIED: "Você não tem permissão para fazer isso.",
  NOT_FOUND: "Não encontramos o que você procurava.",
  METHOD_NOT_ALLOWED: "Operação não permitida.",
  PARSE_ERROR: "Não foi possível ler os dados enviados.",
  TOO_MANY_REQUESTS: "Muitas tentativas em pouco tempo. Aguarde um minuto.",

  VALIDATION_ERROR: "Confira os campos destacados e tente novamente.",
  INTERNAL_ERROR: "Ocorreu um erro inesperado. Tente novamente em instantes.",
};
