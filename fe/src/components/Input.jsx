const Input = ({ className = "", ...props }) => (
  <input
    className={`border border-gray-600 bg-deep-black text-off-white rounded-md px-3 py-2 focus:ring-2 focus:ring-cinema-red ${className}`}
    {...props}
  />
);

export default Input;