/**
 * Input de formulario con el estilo de la marca Tempus.
 * Componente compartido extraído del patrón repetido en los formularios admin/checkout.
 * onChange recibe (name, value) para integrarse con los reducers de formulario existentes.
 */
export function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  step,
  min,
  maxLength,
  autoComplete,
  disabled = false,
  error,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-xs tracking-widest uppercase text-ink-muted">
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        min={min}
        maxLength={maxLength}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`border px-4 py-3 text-sm text-ink-primary bg-pearl focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          error ? 'border-red-600 focus:border-red-600' : 'border-ash focus:border-gold'
        }`}
      />
      {error ? <p className="text-xs text-red-600 tracking-wide">{error}</p> : null}
    </div>
  )
}
