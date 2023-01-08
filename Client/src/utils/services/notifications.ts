export function SendNotification(titulo: string, mensagem: string, onClickCallback: Function) {
    Notification.requestPermission(function () {
        var notification = new Notification(titulo, {
            body: mensagem
        });

        notification.onclick = (e) => onClickCallback(e);
    });
}