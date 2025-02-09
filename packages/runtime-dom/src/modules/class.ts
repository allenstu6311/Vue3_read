export function patchClass(
  el: Element,
  value: string | null,
  isSVG: boolean
): void {
  el.setAttribute("class", value!);
}
