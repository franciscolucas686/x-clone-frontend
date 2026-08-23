import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { editProfileSchema, type EditProfileFormValues } from "@/features/auth/auth.schema";
import { updateProfile } from "@/features/auth/authThunks";
import { clearError } from "@/features/auth/authSlice";
import { useClearAuthErrorOnMount } from "@/features/auth/hooks/useClearAuthErrorOnMount";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Field, Input } from "@/ui/Field";
import { FormError } from "@/ui/FormError";
import { Modal } from "@/ui/Modal";
import { applyServerFieldErrors } from "@/shared/api/form-errors";

/** `undefined` = não mexeu na foto; `File` = trocou; `null` = removeu. */
type AlteracaoDeAvatar = File | null | undefined;

// Mesmos limites de accounts/services.py (MAX_AVATAR_BYTES, TIPOS_ACEITOS). O servidor
// continua sendo quem garante — isto só evita mandar 5MB pela rede só para descobrir,
// no fim, que o formato ou o tamanho nunca iam servir.
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_TIPOS_ACEITOS = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function EditProfileModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const { user, submitting, error } = useAppSelector((s) => s.auth);

  // `user.avatar_url` já chega resolvido: quando ninguém escolheu foto, o backend
  // devolve o avatar padrão nesse mesmo campo (AvatarUrlField, accounts/serializers.py).
  // Antes o frontend guardava sua própria cópia da URL padrão (`DEFAULT_AVATAR_URL`, em
  // shared/config.ts) só para ter algo pra comparar — a mesma string escrita à mão nos
  // dois repositórios, podendo divergir em silêncio.
  const avatarAtual = user?.avatar_url ?? "";
  const [avatar, setAvatar] = useState<AlteracaoDeAvatar>(undefined);
  const [preview, setPreview] = useState(avatarAtual);
  const [erroDoAvatar, setErroDoAvatar] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
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

  useClearAuthErrorOnMount();

  useEffect(() => {
    if (!(avatar instanceof File)) {
      // `avatar === null` é "remover ao salvar": não há URL de padrão para mostrar aqui
      // (deixou de ser conhecida pelo cliente de propósito — ver comentário acima), então
      // a prévia continua sendo a foto atual, com o aviso de texto abaixo indicando a
      // troca que vai acontecer.
      setPreview(avatarAtual);
      return;
    }
    const url = URL.createObjectURL(avatar);
    setPreview(url);
    // Revogar a URL é o que impede o vazamento de memória a cada troca de foto.
    return () => URL.revokeObjectURL(url);
  }, [avatar, avatarAtual]);

  // Fato vindo do servidor (`has_custom_avatar`), não mais deduzido comparando a URL
  // atual com uma URL padrão que o cliente tinha que conhecer de cor.
  const podeRemover = avatar instanceof File || (avatar === undefined && user?.has_custom_avatar);
  const seraRemovido = avatar === null;

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
    if (updateProfile.fulfilled.match(resultado)) {
      onClose();
    } else if (updateProfile.rejected.match(resultado)) {
      // Quando o erro tem campo, ele já acende o Field certo — o banner com a mesma
      // frase embaixo do formulário seria a mesma informação duas vezes na tela.
      if (applyServerFieldErrors(resultado.payload?.details, setError)) {
        dispatch(clearError());
      }
    }
  });

  return (
    <Modal onClose={onClose} title="Editar perfil" className="max-w-[600px]">
      <form onSubmit={salvar} className="flex flex-col gap-4 p-2" noValidate>
        <h2 className="text-xl font-bold">Editar perfil</h2>

        <div className="flex items-center gap-4">
          <Avatar
            src={preview}
            name={user?.name || user?.username}
            size={80}
            className={seraRemovido ? "opacity-40" : ""}
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
                  if (!arquivo) return;

                  if (!AVATAR_TIPOS_ACEITOS.has(arquivo.type)) {
                    setErroDoAvatar("Formato não suportado. Envie uma imagem JPG, PNG ou WEBP.");
                    return;
                  }
                  if (arquivo.size > AVATAR_MAX_BYTES) {
                    setErroDoAvatar("A imagem é grande demais.");
                    return;
                  }
                  setErroDoAvatar(null);
                  setAvatar(arquivo);
                }}
              />
            </label>
            {podeRemover && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setErroDoAvatar(null);
                  setAvatar(null);
                }}
                aria-label="Remover foto"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>
        {seraRemovido && (
          <p className="-mt-2 text-xs text-gray-500">Ao salvar, você volta ao avatar padrão.</p>
        )}

        {erroDoAvatar && (
          <p role="alert" className="-mt-2 text-xs text-red-500">
            {erroDoAvatar}
          </p>
        )}

        <Field label="Nome" error={errors.name?.message}>
          {(props) => <Input {...props} {...register("name")} autoComplete="name" />}
        </Field>

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

        {error && <FormError>{error}</FormError>}

        <Button type="submit" isLoading={submitting} loadingText="Salvando..." className="self-end">
          Salvar
        </Button>
      </form>
    </Modal>
  );
}
