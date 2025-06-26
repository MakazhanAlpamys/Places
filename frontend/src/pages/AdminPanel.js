import React, { useState } from 'react';

function AdminPanel() {
  // Mock data for users
  const initialUsers = [
    { id: 1, username: 'john_doe', email: 'john@example.com', status: 'active' },
    { id: 2, username: 'jane_smith', email: 'jane@example.com', status: 'active' },
    { id: 3, username: 'mark_wilson', email: 'mark@example.com', status: 'blocked' },
    { id: 4, username: 'sarah_johnson', email: 'sarah@example.com', status: 'active' },
    { id: 5, username: 'alex_brown', email: 'alex@example.com', status: 'active' }
  ];

  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleStatus = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        const newStatus = user.status === 'active' ? 'blocked' : 'active';
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:border-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Username</th>
              <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Email</th>
              <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">{user.username}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleToggleStatus(user.id)}
                    className={`mr-2 px-3 py-1 rounded text-white ${
                      user.status === 'active' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {user.status === 'active' ? 'Block' : 'Unblock'}
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel; 