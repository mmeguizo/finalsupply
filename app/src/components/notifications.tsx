import { useNotifications } from "@toolpad/core/useNotifications";
import * as React from "react";

type NotificationDialogProps = {
  message: string;
  severity: "info" | "success" | "warning" | "error";
  duration: number;
  onClose?: () => void;
};

const NotificationDialog = ({
  message,
  severity,
  duration,
  onClose,
}: NotificationDialogProps) => {
  const notifications = useNotifications();

  React.useEffect(() => {
    // Show notification
    const notificationId = notifications.show(message, {
      severity,
      autoHideDuration: duration,
    });

    // Call onClose after duration
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, duration);

    // Clean up function when component unmounts
    return () => {
      clearTimeout(timer);
      notifications.close(notificationId);
    };
  }, [message, severity, duration, onClose, notifications]);

  // Component doesn't render anything visible
  return null;
};

export default NotificationDialog;
