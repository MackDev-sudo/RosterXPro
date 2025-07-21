import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const backgrounds = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  return (
    <div className={`flex items-center p-3 rounded-md border ${backgrounds[type]}`}>
      {icons[type]}
      <p className={`ml-3 text-sm ${textColors[type]} flex-1`}>
        {message}
      </p>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-2 ${textColors[type]} hover:opacity-70`}
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Notification;
