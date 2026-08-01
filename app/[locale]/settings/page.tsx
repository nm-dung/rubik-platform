"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { User, Lock, Trash2, Shield, ChevronRight, X } from "lucide-react";

export default function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const { user, profile, deleteAccount, updatePassword, updateProfile, loading } = useAuth();
  const router = useRouter();
  const isVietnamese = resolvedParams.locale === 'vi';

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [updatingUsername, setUpdatingUsername] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${resolvedParams.locale}/auth/login`);
    }
  }, [user, loading, router, resolvedParams.locale]);

  useEffect(() => {
    if (profile) {
      setUsernameInput(profile.username);
    }
  }, [profile]);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const { error } = await deleteAccount();
    setDeleting(false);
    setShowDeleteConfirm(false);
    
    if (error) {
      alert(error);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError(isVietnamese ? "Mật khẩu phải có ít nhất 6 ký tự" : "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(isVietnamese ? "Mật khẩu không khớp" : "Passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    const { error } = await updatePassword(currentPassword, newPassword);
    setUpdatingPassword(false);

    if (error) {
      setPasswordError(error);
    } else {
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert(isVietnamese ? "Đổi mật khẩu thành công!" : "Password updated successfully!");
    }
  };

  const handleUpdateUsername = async () => {
    setUsernameError(null);

    if (usernameInput.length < 3) {
      setUsernameError(isVietnamese ? "Tên người dùng phải có ít nhất 3 ký tự" : "Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameInput)) {
      setUsernameError(isVietnamese ? "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới" : "Username can only contain letters, numbers, and underscores");
      return;
    }

    setUpdatingUsername(true);
    const { error } = await updateProfile({ username: usernameInput });
    setUpdatingUsername(false);

    if (error) {
      setUsernameError(error);
    } else {
      setEditingUsername(false);
      alert(isVietnamese ? "Cập nhật tên người dùng thành công!" : "Username updated successfully!");
    }
  };

  const handleCreateProfile = async () => {
    if (!usernameInput) {
      setUsernameError(isVietnamese ? "Tên người dùng là bắt buộc" : "Username is required");
      return;
    }

    if (usernameInput.length < 3) {
      setUsernameError(isVietnamese ? "Tên người dùng phải có ít nhất 3 ký tự" : "Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameInput)) {
      setUsernameError(isVietnamese ? "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới" : "Username can only contain letters, numbers, and underscores");
      return;
    }

    setUpdatingUsername(true);
    const { error } = await updateProfile({ username: usernameInput });
    setUpdatingUsername(false);

    if (error) {
      setUsernameError(error);
    } else {
      alert(isVietnamese ? "Tạo hồ sơ thành công!" : "Profile created successfully!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {isVietnamese ? "Cài đặt" : "Settings"}
          </h1>
          <p className="text-slate-600">
            {isVietnamese ? "Quản lý tài khoản và cài đặt của bạn" : "Manage your account and settings"}
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isVietnamese ? "Thông tin tài khoản" : "Account Information"}
              </h2>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {isVietnamese ? "Tên người dùng" : "Username"}
              </label>
              {!profile ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 mb-3">
                    {isVietnamese 
                      ? "Bạn chưa có hồ sơ người dùng. Hãy tạo tên người dùng để bắt đầu." 
                      : "You don't have a user profile yet. Create a username to get started."}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder={isVietnamese ? "rubikmaster" : "rubikmaster"}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleCreateProfile}
                      disabled={updatingUsername}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {updatingUsername ? (isVietnamese ? "Đang tạo..." : "Creating...") : (isVietnamese ? "Tạo hồ sơ" : "Create Profile")}
                    </button>
                  </div>
                  {usernameError && (
                    <p className="text-sm text-red-600 mt-2">{usernameError}</p>
                  )}
                </div>
              ) : editingUsername ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleUpdateUsername}
                    disabled={updatingUsername}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {updatingUsername ? (isVietnamese ? "Đang lưu..." : "Saving...") : (isVietnamese ? "Lưu" : "Save")}
                  </button>
                  <button
                    onClick={() => {
                      setEditingUsername(false);
                      setUsernameInput(profile?.username || "");
                      setUsernameError(null);
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    {isVietnamese ? "Hủy" : "Cancel"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">{profile?.username || 'N/A'}</span>
                  <button
                    onClick={() => {
                      setEditingUsername(true);
                      setUsernameInput(profile?.username || "");
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {isVietnamese ? "Chỉnh sửa" : "Edit"}
                  </button>
                </div>
              )}
              {usernameError && profile && (
                <p className="text-sm text-red-600 mt-1">{usernameError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            {isVietnamese ? "Bảo mật" : "Security"}
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-900">
                  {isVietnamese ? "Đổi mật khẩu" : "Change Password"}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-100">
          <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            {isVietnamese ? "Vùng nguy hiểm" : "Danger Zone"}
          </h2>

          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-sm text-red-700 mb-4">
              {isVietnamese 
                ? "Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn bao gồm tiến độ bài học, lịch sử ôn tập và thống kê thuật toán. Hành động này không thể hoàn tác."
                : "Deleting your account will permanently remove all your data including lesson progress, review history, and algorithm statistics. This action cannot be undone."
              }
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              {isVietnamese ? "Xóa tài khoản" : "Delete Account"}
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isVietnamese ? "Xóa tài khoản?" : "Delete Account?"}
              </h3>
              <p className="text-slate-600 mb-6">
                {isVietnamese 
                  ? "Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn."
                  : "This action cannot be undone. All your data will be permanently deleted."
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  {isVietnamese ? "Hủy" : "Cancel"}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting 
                    ? (isVietnamese ? "Đang xóa..." : "Deleting...")
                    : (isVietnamese ? "Xóa tài khoản" : "Delete account")
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">
                  {isVietnamese ? "Đổi mật khẩu" : "Change Password"}
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {isVietnamese ? "Mật khẩu mới" : "New Password"}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={isVietnamese ? "••••••••" : "••••••••"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {isVietnamese ? "Xác nhận mật khẩu" : "Confirm Password"}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={isVietnamese ? "••••••••" : "••••••••"}
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    disabled={updatingPassword}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {isVietnamese ? "Hủy" : "Cancel"}
                  </button>
                  <button
                    onClick={handleUpdatePassword}
                    disabled={updatingPassword}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {updatingPassword 
                      ? (isVietnamese ? "Đang cập nhật..." : "Updating...")
                      : (isVietnamese ? "Cập nhật" : "Update")
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
