export function maskAdmissionNo(admissionNo: string): string {
  const parts = admissionNo.split("/");
  if (parts.length !== 3) return admissionNo;
  const [prefix, middle, suffix] = parts;
  if (middle.length <= 3) return admissionNo;
  const visible = middle.slice(0, middle.length - 2);
  const masked = "#".repeat(2);
  return `${prefix}/${visible}${masked}/${suffix}`;
}
