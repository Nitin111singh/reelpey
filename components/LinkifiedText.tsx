import React from "react";

/** Matches http(s):// URLs and bare www. links. */
const URL_SPLIT = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
const URL_TEST = /^(https?:\/\/|www\.)/i;
/** Trailing punctuation that shouldn't be part of the link. */
const TRAILING_PUNCT = /[.,;:!?)\]]+$/;

interface LinkifiedTextProps {
  text: string;
  /** Applied to the wrapping <p>. */
  className?: string;
}

/**
 * Renders text with any URLs turned into clickable links.
 *
 * Safe by construction — builds React nodes (no dangerouslySetInnerHTML), so
 * user/admin-authored campaign descriptions can't inject markup. Links open in
 * a new tab with rel="noopener noreferrer nofollow".
 */
export default function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const parts = text.split(URL_SPLIT);

  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (!part) return null;

        if (URL_TEST.test(part)) {
          // Keep trailing punctuation out of the link (e.g. "see https://x.com.")
          const trailing = part.match(TRAILING_PUNCT)?.[0] ?? "";
          const url = trailing ? part.slice(0, -trailing.length) : part;
          const href = url.startsWith("http") ? url : `https://${url}`;

          return (
            <React.Fragment key={i}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-red-400 hover:text-red-300 underline underline-offset-2 break-all"
              >
                {url}
              </a>
              {trailing}
            </React.Fragment>
          );
        }

        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </p>
  );
}
