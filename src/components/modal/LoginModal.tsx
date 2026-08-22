import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "@/features/auth/auth.schema";
import { clearError } from "@/features/auth/authSlice";
import { loginUser } from "@/features/auth/authThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Xlogo } from "@/components/icons/Xlogo";
import { Button } from "@/ui/Button";
import { Field, Input } from "@/ui/Field";
import { Modal } from "@/ui/Modal";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submitting, error } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const entrar = handleSubmit(async (dados) => {
    const resultado = await dispatch(loginUser(dados));
    if (loginUser.fulfilled.match(resultado)) {
      onClose();
      navigate("/feed");
    }
  });

  return (
    <Modal onClose={onClose} title="Entrar no X" className="max-w-[400px]">
      <Xlogo />
      <h2 className="my-6 text-center text-xl">Entrar no X</h2>

      <form onSubmit={entrar} className="flex flex-col gap-5" noValidate>
        <Field label="Nome de usuário" error={errors.username?.message}>
          {(props) => <Input {...props} {...register("username")} autoComplete="username" />}
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
        {error && (
          <p role="alert" className="text-center text-sm text-red-500">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={submitting} loadingText="Entrando...">
          Login
        </Button>
      </form>
    </Modal>
  );
}
