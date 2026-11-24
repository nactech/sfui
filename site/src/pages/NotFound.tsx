import { ArrowLeft, Search } from "lucide-react";
import { ButtonLink } from "@site/components/ButtonLink";
import { PageIntro } from "@site/components/Page";
import { useTitle } from "@site/lib/useTitle";

export function NotFound() {
  useTitle("Not found");
  return (
    <PageIntro
      eyebrow="404"
      title="Lost in the fog."
      lead="This page doesn’t exist — maybe it moved, maybe it never did. Press ⌘K to search, or head back to familiar ground."
      actions={
        <>
          <ButtonLink to="/" variant="primary" leadingIcon={<ArrowLeft />}>
            Home
          </ButtonLink>
          <ButtonLink to="/components" variant="secondary" leadingIcon={<Search />}>
            Browse components
          </ButtonLink>
        </>
      }
    />
  );
}
