'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface UserWithProfile extends User {
  profile?: {
    role: 'user' | 'admin' | 'moderator';
    first_name: string | null;
    last_name: string | null;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to load users');
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRoles((prev) => new Set(prev).add(userId));

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      // Mettre à jour l'état local
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                profile: {
                  ...user.profile,
                  role: newRole as 'user' | 'admin' | 'moderator',
                  first_name: user.profile?.first_name ?? null,
                  last_name: user.profile?.last_name ?? null,
                },
              }
            : user
        )
      );
    } catch (err) {
      console.error('Error updating role:', err);
      alert(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setUpdatingRoles((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Users</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage platform users and their access.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by email or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const currentRole = user.profile?.role || 'user';
                const isUpdating = updatingRoles.has(user.id);

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {user.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentRole}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        disabled={isUpdating}
                        className="w-32"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.created_at
                        ? formatDistanceToNow(new Date(user.created_at), {
                            addSuffix: true,
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.last_sign_in_at
                        ? formatDistanceToNow(new Date(user.last_sign_in_at), {
                            addSuffix: true,
                          })
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-green-500/15 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                        Active
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
