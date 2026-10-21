import { Fragment } from "react";

export function AnimatedWords({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span
        className="inline-block animate-blur-in motion-reduce:animate-none"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        {word}
      </span>
    </Fragment>
  ));
}
