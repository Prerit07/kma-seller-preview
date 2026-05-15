"use client";

export async function getUserCoordinates(): Promise<{ lat: number; lng: number } | null> {
  if (!navigator.geolocation) return null;

  const requestLocation = () =>
    new Promise<{ lat: number; lng: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
      );
    });

  if (navigator.permissions) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: "geolocation" });
      permissionStatus.onchange = () => {
        if (permissionStatus.state === "granted") {
          requestLocation();
        }
      };

      if (permissionStatus.state === "granted") {
        return await requestLocation();
      } else if (permissionStatus.state === "prompt") {
        return await requestLocation();
      } else {
        return null;
      }
    } catch (err) {
      return await requestLocation();
    }
  } else {
    return await requestLocation();
  }
}
