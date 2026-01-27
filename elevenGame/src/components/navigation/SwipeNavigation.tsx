import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ROUTES = ["/", "/leaderboard", "/locker", "/shop", "/store"];
const SWIPE_THRESHOLD = 50;

interface SwipeNavigationProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  disabled = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isNavigating = useRef(false);

  const handleNavigation = useCallback(
    (direction: "next" | "prev") => {
      if (disabled || isNavigating.current) return;

      const currentIndex = ROUTES.indexOf(location.pathname);
      if (currentIndex === -1) return;

      isNavigating.current = true;
      let nextIndex;
      if (direction === "next") {
        // Next page (Swipe Left) moves to index-1 for RTL-style wrap as requested
        // Example: Lobby (0) -> Store (4)
        nextIndex = (currentIndex - 1 + ROUTES.length) % ROUTES.length;
      } else {
        // Previous page (Swipe Right) moves to index+1
        // Example: Store (4) -> Lobby (0)
        nextIndex = (currentIndex + 1) % ROUTES.length;
      }

      navigate(ROUTES[nextIndex]);

      // Reset navigation lock after a short delay
      setTimeout(() => {
        isNavigating.current = false;
      }, 500);
    },
    [location.pathname, navigate, disabled],
  );

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    },
    [disabled],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (
        disabled ||
        touchStartX.current === null ||
        touchStartY.current === null
      )
        return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchStartX.current - touchEndX;
      const deltaY = touchStartY.current - touchEndY;

      // Only navigate if it's primarily a horizontal swipe and exceeds threshold
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > SWIPE_THRESHOLD
      ) {
        if (deltaX > 0) {
          handleNavigation("next");
        } else {
          handleNavigation("prev");
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [handleNavigation, disabled],
  );

  const onWheel = useCallback(
    (e: WheelEvent) => {
      if (disabled || isNavigating.current) return;

      // Check if it's a horizontal wheel event and exceeds threshold
      if (
        Math.abs(e.deltaX) > Math.abs(e.deltaY) &&
        Math.abs(e.deltaX) > SWIPE_THRESHOLD
      ) {
        if (e.deltaX > 0) {
          handleNavigation("next");
        } else {
          handleNavigation("prev");
        }
      }
    },
    [handleNavigation, disabled],
  );

  useEffect(() => {
    if (disabled) return;

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
    };
  }, [onTouchStart, onTouchEnd, onWheel, disabled]);

  return <>{children}</>;
};
