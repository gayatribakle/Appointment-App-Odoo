import { Calendar, Users, FileText, Inbox, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  type?: "appointments" | "users" | "providers" | "reports" | "general" | "error";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  type = "general",
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  const configs = {
    appointments: {
      icon: Calendar,
      title: "No appointments found",
      description: "There are no appointments scheduled. Create your first appointment to get started.",
      actionLabel: "Create Appointment",
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    users: {
      icon: Users,
      title: "No users yet",
      description: "You haven't added any users to the system. Add your first user to begin.",
      actionLabel: "Add User",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    providers: {
      icon: Users,
      title: "No providers available",
      description: "No service providers have been added. Add providers to start managing appointments.",
      actionLabel: "Add Provider",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    reports: {
      icon: FileText,
      title: "No data available",
      description: "There isn't enough data to generate reports yet. Check back after some activity.",
      actionLabel: undefined,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    general: {
      icon: Inbox,
      title: "No items found",
      description: "We couldn't find any items matching your criteria. Try adjusting your filters.",
      actionLabel: undefined,
      iconColor: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    error: {
      icon: AlertCircle,
      title: "Something went wrong",
      description: "We encountered an error loading this data. Please try again later.",
      actionLabel: "Retry",
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
          <Icon className={`w-8 h-8 ${config.iconColor}`} />
        </div>
        <h3 className="text-lg text-gray-900 mb-2">
          {title || config.title}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {description || config.description}
        </p>
        {(actionLabel || config.actionLabel) && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {actionLabel || config.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptySearchResult() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600">No results match your search criteria</p>
        <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search terms</p>
      </div>
    </div>
  );
}
