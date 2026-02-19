export function maskCPF(cpf?: string | null) {
  if (!cpf) return null;
  const digits = cpf.replace(/\D/g, "");
  if (digits.length < 11) return "***";
  return `${digits.slice(0, 3)}.***.***-${digits.slice(-2)}`;
}
