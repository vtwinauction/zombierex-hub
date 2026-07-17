import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MediaComposer } from "@/components/MediaComposer";

export const Route = createFileRoute("/_authenticated/post/new")({
  head: () => ({ meta: [{ title: "New post · ZOMBIEREX" }] }),
  component: NewFeedPost,
});

function NewFeedPost() {
  const navigate = useNavigate();
  return <MediaComposer onDone={() => navigate({ to: "/" })} />;
}
