"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Download, Trash2, Edit, Image as ImageIcon, X, Plus, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface CustomerPhoto {
  id: string;
  customerId: string;
  imageUrl: string;
  description?: string | null;
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CustomerPhotosTabProps {
  customerId: string | null;
}

export default function CustomerPhotosTab({ customerId }: CustomerPhotosTabProps) {
  const [photos, setPhotos] = useState<CustomerPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingPhoto, setEditingPhoto] = useState<CustomerPhoto | null>(null);
  const [editDescription, setEditDescription] = useState("");

  // Get current user (mock - replace with actual auth)
  const currentUser = "TRANG HH"; // TODO: Get from auth context

  useEffect(() => {
    if (customerId) {
      fetchPhotos();
    } else {
      setPhotos([]);
    }
  }, [customerId]);

  const fetchPhotos = async () => {
    if (!customerId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/crm/customers/${customerId}/photos`);
      const result = await response.json();
      if (result.success) {
        setPhotos(result.data);
      } else {
        console.error("Error fetching photos:", result.error);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setSelectedFiles(imageFiles);
  };

  const handleUpload = async () => {
    if (!customerId || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        if (description) {
          formData.append("description", description);
        }
        formData.append("uploadedBy", currentUser);

        const response = await fetch(
          `/api/crm/customers/${customerId}/photos/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to upload photo");
        }
        return result.data;
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      setPhotos((prev) => [...uploadedPhotos, ...prev]);
      setIsUploadModalOpen(false);
      setSelectedFiles([]);
      setDescription("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading photos:", error);
      alert(error.message || "Có lỗi xảy ra khi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!customerId) return;
    if (!confirm("Bạn có chắc muốn xóa ảnh này?")) return;

    try {
      const response = await fetch(
        `/api/crm/customers/${customerId}/photos/${photoId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (result.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      } else {
        throw new Error(result.error || "Failed to delete photo");
      }
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      alert(error.message || "Có lỗi xảy ra khi xóa ảnh");
    }
  };

  const handleDownload = (imageUrl: string, photoId: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `customer-photo-${photoId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (photo: CustomerPhoto) => {
    setEditingPhoto(photo);
    setEditDescription(photo.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto || !customerId) return;

    try {
      // Update description via API (you may need to create a PATCH endpoint)
      // For now, we'll update locally
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === editingPhoto.id
            ? { ...p, description: editDescription }
            : p
        )
      );
      setEditingPhoto(null);
      setEditDescription("");
    } catch (error) {
      console.error("Error updating photo:", error);
    }
  };

  // Group photos by date
  const groupedPhotos = photos.reduce((acc, photo) => {
    const date = new Date(photo.createdAt);
    const dateKey = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(photo);
    return acc;
  }, {} as Record<string, CustomerPhoto[]>);

  if (!customerId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
        <p>Chọn khách hàng để xem ảnh</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm ảnh
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            // Download all photos as ZIP (future feature)
            alert("Tính năng tải về tất cả đang được phát triển");
          }}
          className="flex items-center gap-2"
        >
          <Download size={18} />
          Tải về
        </Button>
        {photos.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xóa tất cả ${photos.length} ảnh?`)) {
                // Delete all photos
                photos.forEach((p) => handleDelete(p.id));
              }
            }}
            className="flex items-center gap-2"
          >
            <Trash2 size={18} />
            Xóa
          </Button>
        )}
        {photos.length > 0 && (
          <div className="ml-auto text-sm text-gray-600">
            Tổng: {photos.length} ảnh
          </div>
        )}
      </div>

      {/* Photos List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : photos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Chưa có ảnh khách hàng</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{date}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {datePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-square bg-gray-100 relative group">
                        <img
                          src={photo.imageUrl}
                          alt={photo.description || "Customer photo"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                          }}
                        />
                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(photo.imageUrl, photo.id)}
                            className="text-white bg-white bg-opacity-20 hover:bg-opacity-30"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEdit(photo)}
                            className="text-white bg-white bg-opacity-20 hover:bg-opacity-30"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDelete(photo.id)}
                            className="text-white bg-white bg-opacity-20 hover:bg-opacity-30"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <Calendar size={12} />
                          <span>
                            {new Date(photo.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {photo.uploadedBy && (
                            <>
                              <span>•</span>
                              <User size={12} />
                              <span>tạo bởi {photo.uploadedBy}</span>
                            </>
                          )}
                        </div>
                        {photo.description && (
                          <p className="text-xs text-gray-700 mt-1">{photo.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thêm ảnh khách hàng</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFiles([]);
                  setDescription("");
                }}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn ảnh
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFiles.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Đã chọn {selectedFiles.length} ảnh
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả cho ảnh..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFiles([]);
                    setDescription("");
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                >
                  {uploading ? "Đang upload..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chỉnh sửa ảnh</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingPhoto(null);
                  setEditDescription("");
                }}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-4">
              <img
                src={editingPhoto.imageUrl}
                alt="Preview"
                className="w-full rounded-lg border"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingPhoto(null);
                    setEditDescription("");
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleSaveEdit}>Lưu</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

