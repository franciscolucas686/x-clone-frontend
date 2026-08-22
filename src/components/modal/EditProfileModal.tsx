import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { editProfileSchema, type EditProfileFormValues } from "@/features/auth/auth.schema";
import { clearError } from "@/features/auth/authSlice";
import { updateProfile } from "@/features/auth/authThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { DEFAULT_AVATAR_URL } from "@/shared/config";
import { Button } from "@/ui/Button";
import { Field, Input } from "@/ui/Field";
import { Modal } from "@/ui/Modal";

/** `undefined` = não mexeu na foto; `File` = trocou; `null` = removeu. */
type AlteracaoDeAvatar = File | null | undefined;

export default function EditProfileModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const { user, submitting, error } = useAppSelector((s) => s.auth);

  const avatarAtual = user?.avatar_url || DEFAULT_AVATAR_URL;
  const [avatar, setAvatar] = useState<AlteracaoDeAvatar>(undefined);
  const [preview, setPreview] = useState(avatarAtual);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      username: user?.username ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (!(avatar instanceof File)) {
      setPreview(avatar === null ? DEFAULT_AVATAR_URL : avatarAtual);
      return;
    }
    const url = URL.createObjectURL(avatar);
    setPreview(url);
    // Revogar a URL é o que impede o vazamento de memória a cada troca de foto.
    return () => URL.revokeObjectURL(url);
  }, [avatar, avatarAtual]);

  const salvar = handleSubmit(async (dados) => {
    const resultado = await dispatch(
      updateProfile({
        name: dados.name,
        username: dados.username,
        // Só envia a senha se ela foi preenchida — vazio significa "não trocar".
        ...(dados.password
          ? { password: dados.password, confirm_password: dados.confirmPassword }
          : {}),
        // `undefined` é omitido pelo service; `null` vira a instrução de remover.
        avatar,
      }),
    );

    // Sem o segundo GET /profile/ que existia aqui: a resposta do PATCH já traz o
    // usuário completo, e o reducer de updateProfile.fulfilled já o gravou. Eram duas
    // requisições por salvamento, a segunda buscando o que a primeira acabara de trazer.
    if (updateProfile.fulfilled.match(resultado)) onClose();
  });

  return (
    <Modal onClose={onClose} title="Editar perfil" className="max-w-[600px]">
      <form onSubmit={salvar} className="flex flex-col gap-4 p-2" noValidate>
        <h2 className="text-xl font-bold">Editar perfil</h2>

        <div className="flex items-center gap-4">
          <img
            src={preview}
            alt="Prévia da foto de perfil"
            className="h-20 w-20 rounded-full object-cover"
          />
          <div className="flex gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-200 px-3 py-1.5 text-sm font-semibold hover:bg-gray-300">
              <Camera size={16} />
              Trocar foto
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) setAvatar(arquivo);
                }}
              />
            </label>
            {preview !== DEFAULT_AVATAR_URL && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAvatar(null)}
                aria-label="Remover foto"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>

        <Field label="Nome" error={errors.name?.message}>
          {(props) => <Input {...props} {...register("name")} autoComplete="name" />}
        </Field>

        <Field label="Nome de usuário" error={errors.username?.message}>
          {(props) => <Input {...props} {...register("username")} autoComplete="username" />}
        </Field>

        <Field
          label="Nova senha"
          error={errors.password?.message}
          hint="Deixe em branco para manter a senha atual"
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

        <Field label="Confirmar nova senha" error={errors.confirmPassword?.message}>
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

        <Button type="submit" isLoading={submitting} loadingText="Salvando..." className="self-end">
          Salvar
        </Button>
      </form>
    </Modal>
  );
}
