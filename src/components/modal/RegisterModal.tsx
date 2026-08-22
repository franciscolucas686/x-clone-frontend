import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { registerSchema, type RegisterFormValues } from "@/features/auth/auth.schema";
import { clearError } from "@/features/auth/authSlice";
import { registerUser } from "@/features/auth/authThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Xlogo } from "@/components/icons/Xlogo";
import { Button } from "@/ui/Button";
import { Field, Input } from "@/ui/Field";
import { Modal } from "@/ui/Modal";

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { submitting, error } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", name: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

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
    }
  });

  return (
    <Modal onClose={onClose} title="Criar sua conta" className="max-w-[400px]">
      <Xlogo />
      <h2 className="my-6 text-center text-xl">Criar sua conta</h2>

      <form onSubmit={criarConta} className="flex flex-col gap-4" noValidate>
        <Field label="Nome de usuário" error={errors.username?.message}>
          {(props) => <Input {...props} {...register("username")} autoComplete="username" />}
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

        {error && (
          <p role="alert" className="text-center text-sm text-red-500">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={submitting} loadingText="Criando...">
          Criar conta
        </Button>
      </form>
    </Modal>
  );
}
