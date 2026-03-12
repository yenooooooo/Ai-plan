// 푸시 알림 수신 처리
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    // JSON 파싱 실패 시 텍스트로 처리
    data = { title: "사장님비서", body: event.data.text() };
  }

  const title = data.title || "사장님비서";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    data: { url: data.url || "/home" },
    tag: data.tag || "default",
    // iOS PWA 호환성을 위한 필수 옵션
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 시 해당 페이지로 이동
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/home";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // 이미 열려있는 창이 있으면 포커스
        for (const client of clients) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        // 없으면 새 창 열기
        return self.clients.openWindow(url);
      })
  );
});
