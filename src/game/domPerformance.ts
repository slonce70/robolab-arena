export function setTextIfChanged(element: HTMLElement, value: string): boolean {
  if (element.textContent === value) return false;
  element.textContent = value;
  return true;
}

export function setClassNameIfChanged(element: HTMLElement, value: string): boolean {
  if (element.className === value) return false;
  element.className = value;
  return true;
}

export function setStylePropertyIfChanged(element: HTMLElement, name: string, value: string): boolean {
  if (element.style.getPropertyValue(name) === value) return false;
  element.style.setProperty(name, value);
  return true;
}
