import type { MDXComponents } from "mdx/types";
import Link from "next/link";

const isInternalHref = (href: string): boolean =>
  href.startsWith("/") || href.startsWith("#");

const mdxComponents = {
  a: ({ children, href, ...props }) =>
    href && isInternalHref(href) ? (
      <Link href={href} {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} {...props}>
        {children}
      </a>
    ),
} satisfies MDXComponents;

export const getMDXComponents = (): MDXComponents => mdxComponents;

export const useMDXComponents = getMDXComponents;
