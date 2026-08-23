import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { registerSchema, type RegisterFormValues } from "@/features/auth/auth.schema";
import { registerUser } from "@/features/auth/authThunks";
import { clearError } from "@/features/auth/authSlice";
import { useClearAuthErrorOnMount } from "@/features/auth/hooks/useClearAuthErrorOnMount";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Xlogo } from "@/components/icons/Xlogo";
import { Button } from "@/ui/Button";
import { Field, Input } from "@/ui/Field";
import { FormError } from "@/ui/FormError";
import { Modal } from "@/ui/Modal";
import { applyServerFieldErrors } from "@/shared/api/form-errors";

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submitting, error } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", name: "", password: "", confirmPassword: "" },
  });

  useClearAuthErrorOnMount();

  const criarConta = handleSubmit(async (dados) => {
    const resultado = await dispatch(
      registerUser({
        username: dados.username,
        name: dados.name ?? "",
        password: dados.password,
        confirmPassword: dados.confirmPassword,
      }),
    );
    if (registerUser.fulfilled.match(resultado)) {
      onClose();
      navigate("/feed");
    } else if (registerUser.rejected.match(resultado)) {
      // Quando o erro tem campo, ele já acende o Field certo — o banner com a mesma
      // frase embaixo do formulário seria a mesma informação duas vezes na tela.
      if (applyServerFieldErrors(resultado.payload?.details, setError)) {
        dispatch(clearError());
      }
    }
  });

  return (
    <Modal onClose={onClose} title="Criar sua conta" className="max-w-[400px]">
      <Xlogo />
      <h2 className="my-6 text-center text-xl">Criar sua conta</h2>

      <form onSubmit={criarConta} className="flex flex-col gap-4" noValidate>
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

        <Field label="Nome" error={errors.name?.message} hint="Opcional">
          {(props) => <Input {...props} {...register("name")} autoComplete="name" />}
        </Field>

        <Field
          label="Senha"
          error={errors.password?.message}
          hint="Mínimo de 8 caracteres, e não só números"
        >
          {(props) => (
            <Input
              {...props}
              {...register("password")}
              type="password"
              autoComplete="new-password"
            />
          )}
        </Field>

        <Field label="Confirmar senha" error={errors.confirmPassword?.message}>
          {(props) => (
            <Input
              {...props}
              {...register("confirmPassword")}
              type="password"
              autoComplete="new-password"
            />
          )}
        </Field>

        {error && <FormError>{error}</FormError>}

        <Button type="submit" isLoading={submitting} loadingText="Criando...">
          Criar conta
        </Button>
      </form>
    </Modal>
  );
}
