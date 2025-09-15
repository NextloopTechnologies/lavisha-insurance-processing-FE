import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Folder } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getNotificationsByParams, markAllRead } from "@/services/notification";
import { format } from "date-fns";

export const NotificationPopover = () => {
  const [openNotification, setOpenNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationData, setNotificationData] = useState<any[]>([]);
  const [unReadCount, setUnReadCount] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  // Fetch notifications
  const getNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotificationsByParams({});
      if (res?.status !== 200) return console.error("error notification read");
      setUnReadCount(res.data.total);
      setNotificationData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  // Auto mark as read when element becomes visible
  useEffect(() => {
    if (!openNotification || !containerRef.current) return;

    const viewedSet = new Set<string>(); // track already marked

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleIds: string[] = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id && !viewedSet.has(id)) {
              visibleIds.push(id);
              viewedSet.add(id);
            }
          }
        });

        if (visibleIds.length > 0) {
          markAllRead(visibleIds, false)
            .then(() => {
              setNotificationData((prev) =>
                prev.map((n) =>
                  visibleIds.includes(n.id) ? { ...n, isRead: true } : n
                )
              );
              setUnReadCount((prev) => Math.max(0, prev - visibleIds.length));
            })
            .catch((err) => {
              console.error("Failed to mark notifications as read:", err);
            });
        }
      },
      {
        root: containerRef.current,
        threshold: 0.3,
        rootMargin: "0px",
      }
    );

    setTimeout(() => {
      const items = containerRef.current?.querySelectorAll(".unread-item");
      items?.forEach((item) => observer.observe(item));
    }, 100);

    return () => observer.disconnect();
  }, [openNotification, notificationData]);

  return (
    <div>
      <Popover open={openNotification} onOpenChange={setOpenNotification}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} className="text-[#3E79D6]" />
            {unReadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {unReadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          className="w-80 p-0 rounded-none"
        >
          <h3 className="text-sm font-semibold text-gray-700 my-4 px-4">
            {notificationData?.length ? "Notifications" : "No Notifications"}
          </h3>
          <div className="border-b" />
          <div className="max-h-[35rem] overflow-y-auto">
            {notificationData.length > 0 && (
              <div ref={containerRef} className="border-b my-4">
                <div className="flex justify-between my-4 pl-4">
                  <p className="text-xs text-gray-700">
                    Unread {unReadCount ? unReadCount : ""}
                  </p>
                  <span
                    onClick={() => {
                      const ids = notificationData
                        .filter((n) => !n.isRead)
                        .map((n) => n.id);
                      if (ids.length === 0) return;
                      markAllRead(ids, true).then(() => {
                        setNotificationData((prev) =>
                          prev.map((n) => ({ ...n, isRead: true }))
                        );
                        setUnReadCount(0);
                      });
                    }}
                    className="text-xs text-gray-700 bg-gray-200 px-2 py-1 cursor-pointer rounded-sm"
                  >
                    Mark All Read
                  </span>
                </div>

                {notificationData
                  .filter((elm) => !elm.isRead)
                  .map((item) => (
                    <div
                      key={item.id}
                      data-id={item.id}
                      className="unread-item flex gap-4 items-start bg-[#0061FE14] px-4 py-2 border-b"
                    >
                      <div className="w-8 h-8 block rounded-full overflow-hidden mt-1">
                        {item.avatar ? (
                          <img src={item.avatar} alt="" />
                        ) : (
                          <span>{item?.message?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-normal text-gray-700">
                          {item.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {format(new Date(item.createdAt), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {notificationData.length > 0 && (
              <div>
                <p className="text-xs text-gray-700 my-4 pl-4">Recent</p>
                {notificationData
                  .filter((elm) => elm.isRead)
                  .map((item) => (
                    <div key={item.id} className="flex gap-2 items-start px-4">
                      <div className="flex-1 pb-4">
                        <p className="text-sm text-gray-700">{item.message}</p>

                        <span className="text-xs text-gray-500">
                          {format(new Date(item.createdAt), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
