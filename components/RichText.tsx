import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import { toPlainText } from "@/lib/portfolio";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="mb-3 font-display text-lg text-text-primary">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-2 mt-4 font-display text-base text-text-primary">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-2 mt-4 font-display text-sm text-text-primary">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="mt-2 max-w-[60ch] border-l-2 border-primary/40 pl-4 text-text-secondary">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="mb-4 text-text-primary/90">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-2 list-disc space-y-1 pl-5 text-text-primary/90">{children}</ul>,
    number: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-5 text-text-primary/90">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:opacity-80">
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code className="rounded-sm bg-surface-2 px-1 py-0.5 font-mono text-xs">{children}</code>,
  },
};

export function RichText({ value, className = "" }: { value: PortableTextBlock[]; className?: string }) {
  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  );
}

export { toPlainText };
