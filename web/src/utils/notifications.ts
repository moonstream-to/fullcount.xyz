export function showNotification(title: string, body: string) {
  if (!("Notification" in window)) {
    console.log("This browser does not support system notifications");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
}

export const playSound = (sound: string) => {
  const soundElement = document.getElementById(sound) as HTMLAudioElement;
  if (!soundElement) {
    return;
  }
  soundElement.play();
};
