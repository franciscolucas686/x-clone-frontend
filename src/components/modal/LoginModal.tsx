import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "@/features/auth/auth.schema";
import { loginUser } from "@/features/auth/authThunks";
import { clearError } from "@/features/auth/authSlice";
import { useClearAuthErrorOnMount } from "@/features/auth/hooks/useClearAuthErrorOnMount";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Xlogo } from "@/components/icons/Xlogo";
import { Button } from "@/ui/Button";
import { Field, Input } from "@/ui/Field";
import { FormError } from "@/ui/FormError";
import { Modal } from "@/ui/Modal";
import { applyServerFieldErrors } from "@/shared/api/form-errors";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submitting, error } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useClearAuthErrorOnMount();

  const entrar = handleSubmit(async (dados) => {
    const resultado = await dispatch(loginUser(dados));
    if (loginUser.fulfilled.match(resultado)) {
      onClose();
      navigate("/feed");
    } else if (loginUser.rejected.match(resultado)) {
      // Quando o erro tem campo, ele já acende o Field certo — o banner com a mesma
      // frase embaixo do formulário seria a mesma informação duas vezes na tela.
      if (applyServerFieldErrors(resultado.payload?.details, setError)) {
        dispatch(clearError());
      }
    }
  });

  return (
    <Modal onClose={onClose} title="Entrar no X" className="max-w-[400px]">
      <Xlogo />
      <h2 className="my-6 text-center text-xl">Entrar no X</h2>

      <form onSubmit={entrar} className="flex flex-col gap-5" noValidate>
        <Field label="Nome de usuário" error={errors.username?.message}>
          {(props) => (
            <Input
              {...props}
              {...register("username")}
              autoComplete="username"
              // Sem isto, o iOS capitaliza a primeira letra do username sozinho — um
              // login que a pessoa digitou certo falha porque o teclado alterou o texto.
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          )}
        </Field>

        <Field label="Senha" error={errors.password?.message}>
          {(props) => (
            <Input
              {...props}
              {...register("password")}
              type="password"
              autoComplete="current-password"
            />
          )}
        </Field>

        {/* Erro do servidor, já traduzido pelo code em shared/api/error-code-map.ts. */}
        {error && <FormError>{error}</FormError>}

        <Button type="submit" isLoading={submitting} loadingText="Entrando...">
          Login
        </Button>
      </form>
    </Modal>
  );
}
