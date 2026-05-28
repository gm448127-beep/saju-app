"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import IntroOnboarding from "@/components/IntroOnboarding";
import OnboardingModal from "@/components/OnboardingModal";
import {
  hasOnboardingInputTarget,
  isIntroOnboarded,
  ONBOARDING_INPUT_TARGET_TODAY,
  setIntroOnboarded,
  setOnboardingInputTarget,
} from "@/lib/onboarding-storage";
import {
  getProfileDisplayName,
  getUserProfile,
  PROFILE_UPDATED_EVENT,
  saveUserProfile,
  type UserBirthProfile,
} from "@/lib/user-profile-storage";

type UserProfileContextValue = {
  profile: UserBirthProfile | null;
  isReady: boolean;
  displayName: string;
  showOnboarding: boolean;
  saveProfile: (profile: Omit<UserBirthProfile, "savedAt">) => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  refreshProfile: () => void;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }
  return ctx;
}

export function useUserProfileOptional() {
  return useContext(UserProfileContext);
}

export default function UserProfileProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserBirthProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const refreshProfile = useCallback(() => {
    setProfile(getUserProfile());
  }, []);

  useEffect(() => {
    refreshProfile();
    setIsReady(true);

    const onUpdate = () => refreshProfile();
    window.addEventListener(PROFILE_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, onUpdate);
  }, [refreshProfile]);

  const isLandingPath =
    pathname === "/landing-mbti" ||
    pathname === "/landing-restart" ||
    pathname === "/landing-decision" ||
    pathname?.startsWith("/landing-");

  useEffect(() => {
    if (!isReady) return;
    if (isLandingPath) {
      setShowIntro(false);
      setShowOnboarding(false);
      return;
    }
    if (!isIntroOnboarded()) {
      setShowIntro(true);
      setShowOnboarding(false);
      return;
    }
    setShowIntro(false);
    const useTodayBirthForm =
      hasOnboardingInputTarget() || pathname === "/today";
    if (!profile && !onboardingDismissed && !useTodayBirthForm) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [isReady, profile, onboardingDismissed, pathname, isLandingPath]);

  const finishIntro = useCallback(() => {
    setIntroOnboarded();
    setShowIntro(false);
  }, []);

  const saveProfile = useCallback((next: Omit<UserBirthProfile, "savedAt">) => {
    saveUserProfile(next);
    refreshProfile();
    setOnboardingDismissed(true);
    setShowOnboarding(false);
  }, [refreshProfile]);

  const value = useMemo<UserProfileContextValue>(
    () => ({
      profile,
      isReady,
      displayName: getProfileDisplayName(profile),
      showOnboarding,
      saveProfile,
      openOnboarding: () => {
        setOnboardingInputTarget(ONBOARDING_INPUT_TARGET_TODAY);
        setOnboardingDismissed(true);
        setShowOnboarding(false);
        router.push("/today#personalize");
      },
      closeOnboarding: () => {
        setOnboardingDismissed(true);
        setShowOnboarding(false);
      },
      refreshProfile,
    }),
    [profile, isReady, showOnboarding, saveProfile, refreshProfile, router],
  );

  return (
    <UserProfileContext.Provider value={value}>
      {children}
      {showIntro && (
        <IntroOnboarding
          onSkip={() => finishIntro()}
          onStart={() => {
            finishIntro();
            setOnboardingInputTarget(ONBOARDING_INPUT_TARGET_TODAY);
            setOnboardingDismissed(true);
            setShowOnboarding(false);
            router.push("/today#personalize");
          }}
        />
      )}
      <OnboardingModal
        open={showOnboarding && !showIntro}
        onComplete={saveProfile}
        onClose={() => {
          setOnboardingDismissed(true);
          setShowOnboarding(false);
        }}
      />
    </UserProfileContext.Provider>
  );
}
