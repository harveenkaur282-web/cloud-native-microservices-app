'use client';

import { useAuth } from '@/hooks/use-auth';
import PageContainer from '@/components/layout/PageContainer';
import { User, Mail, Phone, MapPin, Shield, LogOut, Key } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null; // Route Guard handles redirection
  }

  return (
    <PageContainer
      title="My Profile"
      description="Manage account details and address configurations owned by the User Service."
    >
      <div className="max-w-3xl space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {/* Header section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
            <div className="absolute -bottom-8 left-6">
              <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-slate-800 text-2xl font-bold">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="pt-12 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
              <p className="text-sm text-slate-500">@{user.username}</p>
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Account Information</h3>
                
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <span className="block text-xs text-slate-400">Email Address</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <div>
                    <span className="block text-xs text-slate-400">Phone Number</span>
                    <span className="text-sm font-medium">{user.phone_number || 'Not provided'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <Shield className="h-5 w-5 text-slate-400" />
                  <div>
                    <span className="block text-xs text-slate-400">Status</span>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {user.is_active ? 'Active Account' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery / Address Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Shipping Details</h3>

                <div className="flex items-start gap-3 text-slate-700">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="block text-xs text-slate-400">Primary Delivery Address</span>
                    <p className="text-sm font-medium mt-1 leading-relaxed whitespace-pre-wrap">
                      {user.address || 'No shipping address set.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="flex flex-wrap gap-4 items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Key className="h-4 w-4" />
                <span>Security managed via OAuth 2.0 / JWT Access Token</span>
              </div>

              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 py-2 px-4 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100 hover:text-red-700 focus:outline-none transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
