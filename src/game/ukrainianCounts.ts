export type UkrainianCountForms = {
  one: string;
  few: string;
  many: string;
};

export function formatUkrainianCount(count: number, forms: UkrainianCountForms): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  const noun = lastDigit === 1 && lastTwoDigits !== 11
    ? forms.one
    : lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)
      ? forms.few
      : forms.many;

  return `${count} ${noun}`;
}
