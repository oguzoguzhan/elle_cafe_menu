import { useState } from 'react';
import { adminApi } from '../../lib/adminApi';

export function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [currentPasswordForUsername, setCurrentPasswordForUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [changingUsername, setChangingUsername] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Yeni şifre en az 6 karakter olmalı');
      return;
    }

    setChangingPassword(true);

    try {
      const result = await adminApi.auth.changePassword(currentPassword, newPassword);

      if (result.success) {
        setPasswordMessage('Şifre başarıyla değiştirildi');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(''), 3000);
      } else {
        setPasswordMessage(result.error || 'Şifre değiştirilemedi');
      }
    } catch (error) {
      setPasswordMessage('Bir hata oluştu');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameMessage('');

    if (!newUsername || newUsername.trim().length < 3) {
      setUsernameMessage('Kullanıcı adı en az 3 karakter olmalı');
      return;
    }

    setChangingUsername(true);

    try {
      const result = await adminApi.auth.changeUsername(currentPasswordForUsername, newUsername);

      if (result.success) {
        setUsernameMessage('Kullanıcı adı başarıyla değiştirildi');
        setCurrentPasswordForUsername('');
        setNewUsername('');
        setTimeout(() => setUsernameMessage(''), 3000);
      } else {
        setUsernameMessage(result.error || 'Kullanıcı adı değiştirilemedi');
      }
    } catch (error) {
      setUsernameMessage('Bir hata oluştu');
    } finally {
      setChangingUsername(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Kullanıcı Adı Değiştir</h2>

        <form onSubmit={handleUsernameChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mevcut Şifre
            </label>
            <input
              type="password"
              value={currentPasswordForUsername}
              onChange={(e) => setCurrentPasswordForUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Kullanıcı Adı
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
              minLength={3}
            />
          </div>

          {usernameMessage && (
            <div className={`p-4 rounded-lg ${usernameMessage.includes('başarıyla') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {usernameMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={changingUsername}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {changingUsername ? 'Kullanıcı Adı Değiştiriliyor...' : 'Kullanıcı Adı Değiştir'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Şifre Değiştir</h2>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mevcut Şifre
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Şifre
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
              minLength={6}
            />
          </div>

          {passwordMessage && (
            <div className={`p-4 rounded-lg ${passwordMessage.includes('başarıyla') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {passwordMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {changingPassword ? 'Şifre Değiştiriliyor...' : 'Şifre Değiştir'}
          </button>
        </form>
      </div>
    </div>
  );
}
