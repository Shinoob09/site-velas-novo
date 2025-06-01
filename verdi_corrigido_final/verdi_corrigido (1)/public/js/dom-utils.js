
export const getEl = (id) => document.getElementById(id) || null;

export function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}
