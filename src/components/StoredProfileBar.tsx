"use client";

import {
  getProfileDisplayName,
  profileBirthSummary,
  type UserBirthProfile,
} from "@/lib/user-profile-storage";

interface StoredProfileBarProps {
  profile: UserBirthProfile;
  onEdit?: () => void;
  subtitle?: string;
}

export default function StoredProfileBar({ profile, onEdit, subtitle }: StoredProfileBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8D7C4] bg-[#FFF8EE] px-4 py-3">
      <div>
        <p className="text-xs font-bold text-[#8B6F47]">내 사주 기준</p>
        <p className="mt-0.5 text-sm font-semibold text-[#2F282B]">
          {getProfileDisplayName(profile)}의 흐름
        </p>
        <p className="mt-0.5 text-xs text-[#8A7E78]">{profileBirthSummary(profile)}</p>
        {subtitle && <p className="mt-1 text-xs text-[#6B5E58]">{subtitle}</p>}
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 rounded-full border border-[#D9C8C0] bg-white px-3 py-1.5 text-xs font-bold text-[#8B6F47] transition hover:border-[#8B6F47]"
        >
          수정
        </button>
      )}
    </div>
  );
}
