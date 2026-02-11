import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Users() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error("Kullanıcılar alınamadı:", err);
    }
  };

  const updateRole = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!confirm("Bu kullanıcıyı silmek istediğine emin misin?")) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">👤 Kullanıcı Yönetimi</h1>

      <table className="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Kullanıcı Adı</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Rol</th>
            <th className="p-3 text-left">İşlemler</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.kullanici_id} className="border-b">
              <td className="p-3">{u.kullanici_id}</td>
              <td className="p-3">{u.kullanici_adi}</td>
              <td className="p-3">{u.email}</td>

              <td className="p-3">
                <select
                  value={u.rol}
                  onChange={(e) => updateRole(u.kullanici_id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="okuyucu">Okuyucu</option>
                  <option value="yazar">Yazar</option>
                  <option value="admin">Admin</option>
                </select>
              </td>

              <td className="p-3">
                <button
                  onClick={() => deleteUser(u.kullanici_id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
