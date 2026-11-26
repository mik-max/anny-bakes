/** "→" that nudges forward when its `group` parent (a link or button) is hovered. */
export default function NudgeArrow() {
  return (
    <span
      aria-hidden
      className="inline-block transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
    >
      →
    </span>
  );
}
