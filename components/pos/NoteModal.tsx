"use client";

import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  currentNote: string;
}

export default function NoteModal({
  isOpen,
  onClose,
  onSave,
  currentNote,
}: NoteModalProps) {
  const [note, setNote] = useState(currentNote);

  useEffect(() => {
    if (isOpen) {
      setNote(currentNote);
    }
  }, [isOpen, currentNote]);

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm ghi chú"
      size="md"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">
            Lưu
          </Button>
        </div>
      }
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú cho đơn hàng
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          placeholder="Nhập ghi chú cho đơn hàng này (ví dụ: khách hàng yêu cầu giao hàng, lưu ý về sản phẩm...)"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {note.length} / 500 ký tự
        </p>
      </div>
    </Modal>
  );
}

