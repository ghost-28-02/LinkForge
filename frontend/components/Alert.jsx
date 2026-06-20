export default function Alert({ type = 'error', children }) {
  if (!children) return null;
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-100',
    success: 'bg-green-50 text-green-700 border-green-100',
    info: 'bg-brand-50 text-brand-700 border-brand-100',
  };
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${styles[type] || styles.error}`}
      role="alert"
    >
      {children}
    </div>
  );
}
