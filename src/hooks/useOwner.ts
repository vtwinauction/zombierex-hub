import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { checkOwner } from "@/lib/owner.functions";

export function useOwner() {
  const fn = useServerFn(checkOwner);
  const q = useQuery({
    queryKey: ["owner", "check"],
    queryFn: () => fn({ data: undefined as any }),
    staleTime: 60_000,
    retry: false,
  });
  return { isOwner: !!q.data?.isOwner, loading: q.isLoading, userId: q.data?.userId };
}
