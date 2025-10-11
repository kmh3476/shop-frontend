// src/components/InputField.jsx
export default function InputField({ label, name, type, value, onChange, required }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}
