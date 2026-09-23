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
  const isVietnamese = (resolvedParams.locale as 'en' | 'vi') === 'vi';

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
      router.push(`/${resolvedParams.locale as 'en' | 'vi'}/auth/login`);
    }
  }, [user, loading, router, resolvedParams.locale as 'en' | 'vi']);

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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-slate-600 dark:text-slate-400">Please sign in to access settings</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
            {isVietnamese ? "Cài đặt" : "Settings"}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {isVietnamese ? "Quản lý tài khoản và cài đặt của bạn" : "Manage your account and settings"}
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                {isVietnamese ? "Thông tin tài khoản" : "Account Information"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {isVietnamese ? "Tên người dùng" : "Username"}
              </label>
              {!profile ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-400 mb-3">
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
                      className="flex-1 px-3 sm:px-4 py-2 border border-slate-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={handleCreateProfile}
                      disabled={updatingUsername}
                      className="px-3 sm:px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 text-sm"
                    >
                      {updatingUsername ? (isVietnamese ? "Đang tạo..." : "Creating...") : (isVietnamese ? "Tạo hồ sơ" : "Create Profile")}
                    </button>
                  </div>
                  {usernameError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">{usernameError}</p>
                  )}
                </div>
              ) : editingUsername ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 border border-slate-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleUpdateUsername}
                    disabled={updatingUsername}
                    className="px-3 sm:px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 text-sm"
                  >
                    {updatingUsername ? (isVietnamese ? "Đang lưu..." : "Saving...") : (isVietnamese ? "Lưu" : "Save")}
                  </button>
                  <button
                    onClick={() => {
                      setEditingUsername(false);
                      setUsernameInput(profile?.username || "");
                      setUsernameError(null);
                    }}
                    className="px-3 sm:px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    {isVietnamese ? "Hủy" : "Cancel"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-slate-900 dark:text-white text-sm">{profile?.username || 'N/A'}</span>
                  <button
                    onClick={() => {
                      setEditingUsername(true);
                      setUsernameInput(profile?.username || "");
                    }}
                    className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    {isVietnamese ? "Chỉnh sửa" : "Edit"}
                  </button>
                </div>
              )}
              {usernameError && profile && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{usernameError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            {isVietnamese ? "Bảo mật" : "Security"}
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-gray-700 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-white text-sm">
                  {isVietnamese ? "Đổi mật khẩu" : "Change Password"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-red-100 dark:border-red-900/30">
          <h2 className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400 mb-3 sm:mb-4 flex items-center gap-2">
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            {isVietnamese ? "Vùng nguy hiểm" : "Danger Zone"}
          </h2>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 mb-3 sm:mb-4">
              {isVietnamese 
                ? "Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn bao gồm tiến độ bài học, lịch sử ôn tập và thống kê thuật toán. Hành động này không thể hoàn tác."
                : "Deleting your account will permanently remove all your data including lesson progress, review history, and algorithm statistics. This action cannot be undone."
              }
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-3 sm:px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-sm"
            >
              {isVietnamese ? "Xóa tài khoản" : "Delete Account"}
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                {isVietnamese ? "Xóa tài khoản?" : "Delete Account?"}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4 sm:mb-6">
                {isVietnamese 
                  ? "Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn."
                  : "This action cannot be undone. All your data will be permanently deleted."
                }
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
                >
                  {isVietnamese ? "Hủy" : "Cancel"}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 px-3 sm:px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-800 transition-colors disabled:opacity-50 text-sm"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {isVietnamese ? "Đổi mật khẩu" : "Change Password"}
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {isVietnamese ? "Mật khẩu mới" : "New Password"}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                    placeholder={isVietnamese ? "••••••••" : "••••••••"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {isVietnamese ? "Xác nhận mật khẩu" : "Confirm Password"}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                    placeholder={isVietnamese ? "••••••••" : "••••••••"}
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs sm:text-sm">
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    disabled={updatingPassword}
                    className="flex-1 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
                  >
                    {isVietnamese ? "Hủy" : "Cancel"}
                  </button>
                  <button
                    onClick={handleUpdatePassword}
                    disabled={updatingPassword}
                    className="flex-1 px-3 sm:px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 text-sm"
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
