import { ILoadingOptions, Loading } from "notiflix";

export function showCircleLoading(callback: Function, message?: string, options?: ILoadingOptions) {

    try {
        console.log(Loading.circle)
        Loading.circle(message, options);
        const result = callback();
        hideLoading();
        return result;
    }
    catch {
        hideLoading();
    }

}

export function hideLoading() {
    Loading.remove();
}