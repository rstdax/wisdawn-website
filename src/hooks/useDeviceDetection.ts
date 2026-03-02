import { useMemo } from 'react'

export interface DeviceInfo {
  isAndroid: boolean
  isIOS: boolean
  isIPadOS: boolean
  isMacOS: boolean
  isWindows: boolean
  isLinux: boolean
  isDesktop: boolean
  isMobile: boolean
  isTablet: boolean
  canAccessFullSite: boolean
}

/**
 * Hook to detect device type and OS using navigator.userAgent
 * SSR-safe: Returns default values on server, actual detection on client
 */
export function useDeviceDetection(): DeviceInfo {
  const deviceInfo = useMemo<DeviceInfo>(() => {
    // SSR safety check
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        isAndroid: false,
        isIOS: false,
        isIPadOS: false,
        isMacOS: false,
        isWindows: false,
        isLinux: false,
        isDesktop: true,
        isMobile: false,
        isTablet: false,
        canAccessFullSite: true, // Default to allowing access on SSR
      }
    }

    const userAgent = navigator.userAgent.toLowerCase()
    const platform = navigator.platform?.toLowerCase() || ''
    const hasMSStream = 'MSStream' in window

    // Detect Android
    const isAndroid = /android/.test(userAgent)

    // Detect iOS (iPhone/iPod)
    const isIOS = /iphone|ipod/.test(userAgent) && !hasMSStream

    // Detect iPadOS (iPad)
    // Modern iPads report as Mac, so we need additional checks
    const isIPadOS =
      (/ipad/.test(userAgent) && !hasMSStream) ||
      (platform === 'macintel' && navigator.maxTouchPoints > 1)

    // Detect macOS (excluding iPadOS)
    const isMacOS = /mac/.test(platform) && !isIPadOS

    // Detect Windows
    const isWindows = /win/.test(platform)

    // Detect Linux
    const isLinux = /linux/.test(platform) && !isAndroid

    // Determine if mobile
    const isMobile = isAndroid || isIOS

    // Determine if tablet
    const isTablet = isIPadOS

    // Determine if desktop
    const isDesktop = !isMobile && !isTablet

    // Android users cannot access full site
    const canAccessFullSite = !isAndroid

    return {
      isAndroid,
      isIOS,
      isIPadOS,
      isMacOS,
      isWindows,
      isLinux,
      isDesktop,
      isMobile,
      isTablet,
      canAccessFullSite,
    }
  }, [])

  return deviceInfo
}
