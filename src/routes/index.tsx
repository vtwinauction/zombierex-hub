import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { StoriesRail } from "@/components/StoriesRail";
import { PostCard } from "@/components/PostCard";
import { posts } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: FeedPage,
});

function FeedPage() {
  return (
    <>
      <TopBar showLogo />
      <StoriesRail />
      <div className="border-t border-border/60">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        <div className="px-4 py-10 text-center">
          <p className="font-display text-sm tracking-[0.3em] text-muted-foreground">END OF THE ROAD</p>
          <p className="mt-1 text-xs text-muted-foreground">Pull the throttle to load more.</p>
        </div>
      </div>
    </>
  );
}
