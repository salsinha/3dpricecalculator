export function toUserMessage(error) {
  const message = String(error?.message || error || "");
  const code = String(error?.code || "");

  if (/electricity_profiles/i.test(message)) {
    return "Falta criar os perfis de eletricidade. Execute o ficheiro supabase/migrations/002_electricity_profiles.sql no Supabase.";
  }

  if (/piece_plates|p_plates|plate_id/i.test(message)) {
    return "Falta preparar as plates das peças. Execute o ficheiro supabase/migrations/003_piece_plates.sql no Supabase.";
  }

  if (
    /relation|schema cache|does not exist|Could not find the table|column/i.test(
      message,
    )
  ) {
    return "A base de dados ainda não está preparada. Execute o ficheiro supabase/migrations/001_init.sql no Supabase.";
  }

  if (
    code === "23503" ||
    /piece_filaments_filament_id_fkey|foreign key/i.test(message)
  ) {
    return "Este filamento está associado a uma peça e não pode ser eliminado.";
  }

  if (code === "23505" || /duplicate key|unique/i.test(message)) {
    return "Já existe um registo com estes dados.";
  }

  if (/Invalid login credentials/i.test(message)) {
    return "Email ou palavra-passe incorretos.";
  }

  if (/Email not confirmed/i.test(message)) {
    return "Confirme o email antes de entrar. No Supabase pode desativar a confirmação em Authentication.";
  }

  if (/Too many requests|rate limit/i.test(message)) {
    return "Muitas tentativas. Aguarde um momento e tente novamente.";
  }

  if (/Failed to fetch|NetworkError|network/i.test(message)) {
    return "Sem ligação ao Supabase. Verifique a internet e as credenciais.";
  }

  if (/Sessão/i.test(message) || /Filamento inválido|Peça não encontrada|Valores numéricos/i.test(message)) {
    return message;
  }

  if (message && message.length < 180 && !/jwt|stack|postgres/i.test(message)) {
    return message;
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}
