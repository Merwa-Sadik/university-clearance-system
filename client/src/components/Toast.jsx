import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "bg-green-600",
    error:   "bg-red-600",
    info:    "bg-blue-700",
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 ${colors[type]} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`}>
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-auto text-white/80 hover:text-white text-lg leading-none">&times;</button>
    </div>
  );
};

export default Toast;
