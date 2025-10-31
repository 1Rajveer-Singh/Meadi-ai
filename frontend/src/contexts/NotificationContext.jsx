import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    // Sample notifications - replace with API data
    {
      id: '1',
      title: 'CRITICAL: Patient Deterioration Alert',
      description: 'Sarah Mitchell (Room 412) - 89% probability of sepsis within 2 hours. Vital signs trending: BP↓ HR↑ Temp↑',
      priority: 'critical',
      category: 'clinical',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      read: false,
      actions: [
        { label: 'VIEW PATIENT', primary: true },
        { label: 'INITIATE PROTOCOL', primary: false },
      ],
    },
    {
      id: '2',
      title: 'AI Analysis Complete',
      description: 'CT Chest (John Davidson, MRN: 45823) - 3 findings flagged. Suspicious 2.8cm RUL nodule detected',
      priority: 'high',
      category: 'workflow',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
      actions: [
        { label: 'REVIEW FINDINGS', primary: true },
        { label: 'GENERATE REPORT', primary: false },
      ],
    },
    {
      id: '3',
      title: 'New Study Assignment',
      description: '8 chest X-rays assigned to your worklist (Priority: Routine). All pre-analyzed.',
      priority: 'medium',
      category: 'workflow',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
      actions: [
        { label: 'OPEN WORKLIST', primary: true },
      ],
    },
    {
      id: '4',
      title: 'Drug Interaction Alert',
      description: 'Potential interaction detected between Warfarin and new prescription (Aspirin) for patient M. Rodriguez',
      priority: 'high',
      category: 'drug',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
      actions: [
        { label: 'REVIEW', primary: true },
        { label: 'VIEW ALTERNATIVES', primary: false },
      ],
    },
    {
      id: '5',
      title: 'Surge Capacity Alert',
      description: 'AI predicts 35% increase in ER volume tomorrow (2-8pm window). Recommendation: Add 1 physician, 2 nurses.',
      priority: 'medium',
      category: 'operational',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
      actions: [
        { label: 'VIEW FORECAST', primary: true },
      ],
    },
    {
      id: '6',
      title: 'Quality Review Required',
      description: 'AI-Human Discrepancy on Case #A8234 (Chest CT). AI detected small pneumothorax (88% confidence).',
      priority: 'high',
      category: 'quality',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      actions: [
        { label: 'REVIEW CASE', primary: true },
        { label: 'ACKNOWLEDGE', primary: false },
      ],
    },
    {
      id: '7',
      title: 'New Clinical Evidence',
      description: 'Updated guidelines for pulmonary nodule management (Fleischner 2025). Affects 12 of your pending cases.',
      priority: 'medium',
      category: 'research',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: true,
      actions: [
        { label: 'READ SUMMARY', primary: true },
      ],
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const addNotification = (notification) => {
    setNotifications(prev => [
      {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  // Simulate real-time notifications (for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add a new notification every 2-5 minutes (for demo)
      if (Math.random() > 0.9) {
        const demoNotifications = [
          {
            title: 'New Patient Admission',
            description: 'Emergency admission: Male, 45, chest pain. Awaiting initial assessment.',
            priority: 'high',
            category: 'clinical',
          },
          {
            title: 'Lab Results Available',
            description: 'Complete blood count results ready for patient ID 12847.',
            priority: 'medium',
            category: 'workflow',
          },
        ];
        const randomNotif = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
        addNotification(randomNotif);
      }
    }, 120000); // Check every 2 minutes

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
