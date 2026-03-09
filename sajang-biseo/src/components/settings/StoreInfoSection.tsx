"use client";

import { Store, Check, Save } from "lucide-react";
import { BUSINESS_TYPES } from "@/lib/constants";

interface StoreInfoSectionProps {
  storeName: string;
  businessType: string;
  address: string;
  phone: string;
  saving: boolean;
  saved: boolean;
  onStoreNameChange: (v: string) => void;
  onBusinessTypeChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onSave: () => void;
}

export function StoreInfoSection({
  storeName, businessType, address, phone,
  saving, saved,
  onStoreNameChange, onBusinessTypeChange, onAddressChange, onPhoneChange, onSave,
}: StoreInfoSectionProps) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Store size={16} className="text-primary-500" />
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">매장 정보</h3>
      </div>

      <div>
        <label className="block text-caption text-[var(--text-tertiary)] mb-1.5">매장명</label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => onStoreNameChange(e.target.value)}
          placeholder="예: 맛있는 한식당"
          className="w-full h-10 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
            border border-[var(--border-default)] focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-caption text-[var(--text-tertiary)] mb-1.5">업종</label>
        <div className="grid grid-cols-4 gap-1.5">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onBusinessTypeChange(type)}
              className={`h-9 rounded-xl text-[13px] font-medium border transition-all duration-150 press-effect ${
                businessType === type
                  ? "bg-primary-500/10 border-primary-500 text-primary-500"
                  : "bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border-default)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-caption text-[var(--text-tertiary)] mb-1.5">주소 (선택)</label>
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="예: 서울시 강남구 역삼동 123"
          className="w-full h-10 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
            border border-[var(--border-default)] focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-caption text-[var(--text-tertiary)] mb-1.5">전화번호 (선택)</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="예: 02-1234-5678"
          className="w-full h-10 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small text-[var(--text-primary)]
            border border-[var(--border-default)] focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>

      <button
        onClick={onSave}
        disabled={!storeName.trim() || saving || saved}
        className={`w-full h-10 rounded-xl font-medium text-body-small flex items-center justify-center gap-2 transition-all duration-200
          ${saved ? "bg-[var(--success)] text-white" : "bg-primary-500 text-white hover:bg-primary-600"}
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {saved ? <><Check size={15} />저장됨</> : saving ? "저장 중..." : <><Save size={15} />저장</>}
      </button>
    </div>
  );
}
