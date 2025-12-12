"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import {
  Calendar,
  Users,
  Scissors,
  Package,
  UserCircle,
  BarChart3,
  ShoppingCart,
  CheckCircle,
  Sparkles,
  BookOpen,
  FileText,
  Workflow,
  TrendingUp,
  DollarSign,
  Target,
  Phone,
  Award,
  Heart,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CTSSRole } from "@/features/auth/types";

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  roles: CTSSRole[];
}

const modules: ModuleCard[] = [
  {
    id: "booking",
    title: "Đặt lịch",
    description: "Quản lý lịch hẹn và calendar",
    icon: Calendar,
    href: "/booking",
    color: "bg-blue-500",
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"],
  },
  {
    id: "crm",
    title: "CRM",
    description: "Quản lý khách hàng",
    icon: Users,
    href: "/crm",
    color: "bg-green-500",
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST"],
  },
  {
    id: "services",
    title: "Dịch vụ",
    description: "Quản lý dịch vụ salon",
    icon: Scissors,
    href: "/services",
    color: "bg-purple-500",
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"],
  },
  {
    id: "inventory",
    title: "Kho hàng",
    description: "Quản lý tồn kho",
    icon: Package,
    href: "/inventory",
    color: "bg-orange-500",
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
  },
  {
    id: "staff",
    title: "Nhân viên",
    description: "Quản lý nhân viên",
    icon: UserCircle,
    href: "/staff-management",
    color: "bg-pink-500",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "reports",
    title: "Báo cáo",
    description: "Báo cáo và phân tích",
    icon: BarChart3,
    href: "/reports",
    color: "bg-indigo-500",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "sales",
    title: "Sales",
    description: "Báo cáo bán hàng",
    icon: TrendingUp,
    href: "/sales",
    color: "bg-teal-500",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "quality",
    title: "Quality",
    description: "Kiểm soát chất lượng",
    icon: CheckCircle,
    href: "/quality",
    color: "bg-emerald-500",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Marketing & campaigns",
    icon: Sparkles,
    href: "/marketing/dashboard",
    color: "bg-rose-500",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "training",
    title: "Training",
    description: "Đào tạo nhân viên",
    icon: BookOpen,
    href: "/training/dashboard",
    color: "bg-cyan-500",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "sop",
    title: "SOP",
    description: "Quy trình chuẩn",
    icon: FileText,
    href: "/sop",
    color: "bg-amber-500",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "workflow",
    title: "Workflow",
    description: "Quản lý workflow",
    icon: Workflow,
    href: "/workflow-console",
    color: "bg-violet-500",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "pos",
    title: "POS",
    description: "Hệ thống bán hàng",
    icon: ShoppingCart,
    href: "/pos",
    color: "bg-lime-500",
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
  },
  {
    id: "financial",
    title: "Tài chính",
    description: "Báo cáo tài chính",
    icon: DollarSign,
    href: "/reports/financial",
    color: "bg-sky-500",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "membership",
    title: "Membership",
    description: "Quản lý thành viên",
    icon: Award,
    href: "/membership",
    color: "bg-yellow-500",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "voice",
    title: "Voice Analytics",
    description: "Phân tích cuộc gọi",
    icon: Phone,
    href: "/voice",
    color: "bg-blue-600",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    id: "hair-health",
    title: "Hair Health",
    description: "Sức khỏe tóc",
    icon: Heart,
    href: "/hair-health",
    color: "bg-red-500",
    roles: ["ADMIN", "MANAGER", "STYLIST"],
  },
];

export default function DashboardModuleGrid() {
  const router = useRouter();
  const { user, hasAnyRole } = useAuth();

  const visibleModules = modules.filter((module) => {
    if (!user) return false;
    return hasAnyRole(module.roles);
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {visibleModules.map((module) => {
        const Icon = module.icon;
        return (
          <Card
            key={module.id}
            className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => router.push(module.href)}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`${module.color} p-4 rounded-full text-white`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {module.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {module.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
