import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentProps } from "react";

const ScrollableTable = ({ children, ...props }: ComponentProps<"table">) => (
  <section
    aria-label="Scrollable data table"
    className="typeset-scroll scroll-fade-x focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wide tables need a keyboard-focusable scroll container
    tabIndex={0}
  >
    <table {...props}>{children}</table>
  </section>
);

const isInternalHref = (href: string): boolean =>
  href.startsWith("/") || href.startsWith("#");

const MarkdownLink = ({ children, href, ...props }: ComponentProps<"a">) => {
  if (href && isInternalHref(href)) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
};

const mdxComponents = {
  a: MarkdownLink,
  table: ScrollableTable,
} satisfies MDXComponents;

export const getMDXComponents = (): MDXComponents => mdxComponents;

export const useMDXComponents = getMDXComponents;
