import { toUserMessage } from "@/lib/errors";
import EmptyState from "@/components/EmptyState";

export default function QueryError({ error }) {
  return (
    <EmptyState
      title="Não foi possível carregar os dados"
      description={toUserMessage(error)}
    />
  );
}
