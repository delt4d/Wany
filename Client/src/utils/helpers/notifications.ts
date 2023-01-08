import { INotifyOptions, Notify } from "notiflix";

export enum NotificationTypes {
    Error = "error",
    Success = "success",
    Info = "info",
    Warning = "warning"
}

export interface INotificationOptions extends INotifyOptions { }

export function showNotification(message: string, type: NotificationTypes, callbackOrOptions?: (() => void) | INotificationOptions, options?: INotificationOptions) {
    let notify: Function = () => { };

    switch (type) {
        case NotificationTypes.Error:
            notify = Notify.failure
            break;

        case NotificationTypes.Success:
            notify = Notify.success
            break;

        case NotificationTypes.Info:
            notify = Notify.info
            break;

        case NotificationTypes.Warning:
            notify = Notify.warning
            break;
    }

    notify(message, callbackOrOptions, { ...options, className: "notification" });
}