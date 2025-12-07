"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ServiceData {
  id: string;
  name: string;
  count: number;
  revenue: number;
  profit: number;
  trend: number;
}

interface TopServicesTableProps {
  data: ServiceData[];
}

export default function TopServicesTable({ data }: TopServicesTableProps) {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Top Services</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent" style={{ backgroundColor: "#F8FAFB" }}>
              <TableHead className="font-semibold text-gray-700">Service</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Count</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Revenue</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Profit</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Trend %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((service) => (
                <TableRow
                  key={service.id}
                  className="hover:transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(164, 227, 227, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <TableCell>
                    <p className="font-medium text-gray-900">{service.name}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-gray-900">{service.count}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(service.revenue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(service.profit)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {getTrendIcon(service.trend)}
                      <span className={`font-medium ${getTrendColor(service.trend)}`}>
                        {Math.abs(service.trend).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
