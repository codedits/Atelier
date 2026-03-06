/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'

interface StoreSettings {
  store_name: string
  contact_phone: string
  contact_email: string
  cod_areas: string
  delivery_charge: string
  free_delivery_above: string
  bank_name: string
  bank_account: string
  bank_holder: string
  bank_iban: string
  jazzcash_number: string
  easypaisa_number: string
}

const defaultSettings: StoreSettings = {
  store_name: 'Atelier',
  contact_phone: '',
  contact_email: '',
  cod_areas: '',
  delivery_charge: '0',
  free_delivery_above: '0',
  bank_name: '',
  bank_account: '',
  bank_holder: '',
  bank_iban: '',
  jazzcash_number: '',
  easypaisa_number: ''
}

// Icons
const Icons = {
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  store: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  truck: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  creditCard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

function SettingsContent() {
  const api = useAdminApi()
  const toast = useToast()
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await api.get<StoreSettings>('/settings')
      setSettings({ ...defaultSettings, ...data })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setSaved(false)

    try {
      await api.put('/settings', settings)
      toast.success('Settings saved successfully')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key: keyof StoreSettings, value: string) => {
    setSettings(s => ({ ...s, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[#666]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={saveSettings} className="max-w-3xl space-y-8">
      {/* Store Info */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center gap-3">
          <span className="text-[#888]">{Icons.store}</span>
          <div>
            <h3 className="text-base font-semibold text-white">Store Information</h3>
            <p className="text-[#555] text-sm mt-0.5">Basic details about your store</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Store Name</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={e => updateField('store_name', e.target.value)}
              className="admin-input w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Contact Phone</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={e => updateField('contact_phone', e.target.value)}
                className="admin-input w-full"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={e => updateField('contact_email', e.target.value)}
                className="admin-input w-full"
                placeholder="contact@store.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center gap-3">
          <span className="text-[#888]">{Icons.truck}</span>
          <div>
            <h3 className="text-base font-semibold text-white">Delivery Settings</h3>
            <p className="text-[#555] text-sm mt-0.5">Configure shipping and delivery options</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">COD Service Areas</label>
            <textarea
              value={settings.cod_areas}
              onChange={e => updateField('cod_areas', e.target.value)}
              className="admin-input w-full h-20 resize-none"
              placeholder="e.g., All major cities, Metro Manila, etc."
            />
            <p className="text-[11px] text-[#666] mt-1">Areas where Cash on Delivery is available</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Delivery Charge ($)</label>
              <input
                type="number"
                value={settings.delivery_charge}
                onChange={e => updateField('delivery_charge', e.target.value)}
                className="admin-input w-full"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Free Delivery Above ($)</label>
              <input
                type="number"
                value={settings.free_delivery_above}
                onChange={e => updateField('free_delivery_above', e.target.value)}
                className="admin-input w-full"
                placeholder="0 to disable"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center gap-3">
          <span className="text-[#888]">{Icons.creditCard}</span>
          <div>
            <h3 className="text-base font-semibold text-white">Payment Methods</h3>
            <p className="text-[#555] text-sm mt-0.5">Payment information shown to customers at checkout</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Mobile Wallets */}
          <div>
            <h4 className="text-sm font-medium text-[#ccc] mb-3">Mobile Wallets</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">JazzCash Number</label>
                <input
                  type="text"
                  value={settings.jazzcash_number}
                  onChange={e => updateField('jazzcash_number', e.target.value)}
                  className="admin-input w-full"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">EasyPaisa Number</label>
                <input
                  type="text"
                  value={settings.easypaisa_number}
                  onChange={e => updateField('easypaisa_number', e.target.value)}
                  className="admin-input w-full"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="border-t border-[#1a1a1a] pt-5">
            <h4 className="text-sm font-medium text-[#ccc] mb-3">Bank Transfer</h4>
            <div>
              <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Bank Name</label>
              <input
                type="text"
                value={settings.bank_name}
                onChange={e => updateField('bank_name', e.target.value)}
                className="admin-input w-full"
                placeholder="Enter bank name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Account Number</label>
                <input
                  type="text"
                  value={settings.bank_account}
                  onChange={e => updateField('bank_account', e.target.value)}
                  className="admin-input w-full"
                  placeholder="Account number"
                />
              </div>
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={settings.bank_holder}
                  onChange={e => updateField('bank_holder', e.target.value)}
                  className="admin-input w-full"
                  placeholder="Account holder name"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">IBAN</label>
              <input
                type="text"
                value={settings.bank_iban}
                onChange={e => updateField('bank_iban', e.target.value)}
                className="admin-input w-full"
                placeholder="PK00XXXX0000000000000000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="admin-btn admin-btn-primary py-3 px-6"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Settings'
          )}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-[#50e3c2] text-sm">
            {Icons.check}
            Settings saved successfully
          </span>
        )}
      </div>
    </form>
  )
}

export default function AdminSettingsClientPage() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <AdminLayout title="Settings" subtitle="Configure your store preferences">
          <SettingsContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
