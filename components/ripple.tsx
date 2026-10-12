/** Rings that spread from the center of the parent for as long as it is hovered. */
export function Ripple() {
  return (
    <span aria-hidden="true" className="ripple">
      <span />
      <span />
      <span />
    </span>
  );
}
