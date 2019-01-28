
export class UserInfo {
    constructor() {
        this.id = null;
        this.date = null;
        this.time_start = 0;
        this.time_duration = 0;
    }
}


export const ControlState = {
    CAMERA_FLY : 0,
    OBJECT_NAVIGATION : 1,
};

export const MouseState = {
    CLICK : 0,
    DRAG : 1,
};

export const MouseButtonState = {
    LEFT_PRESSED : 0,
    RIGHT_PRESSED : 1,
    RELEASED : 2,
};

window.xhr_json = function (type, url) {
    return new Promise((resolve, reject) => {
        let xhr0 = new XMLHttpRequest();
        xhr0.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                let res = JSON.parse(this.response);
                resolve(res);
            }
        };
        xhr0.open(type, "/Scan2CAD/" + url, true);
        xhr0.send();
    });
};

window.xhr = function (type, url) {
    return new Promise((resolve, reject) => {
        let xhr0 = new XMLHttpRequest();
        xhr0.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                resolve(this.response);
            }
        };
        xhr0.open(type,"/Scan2CAD/" + url, true);
        xhr0.send();
    });
};

window.xhr_push = function (type, url, data) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(type,"/Scan2CAD/" + url);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                let res = JSON.parse(this.response);
                resolve(res);
            }
        };
        xhr.send(JSON.stringify(data));
    });
};

window.xhr_goto_url = function (type, url) {
    let xhr0 = new XMLHttpRequest();
    xhr0.onload = function() {
        document.body.innerHTML = this.response;
    }
    xhr0.responseType = "document";
    xhr0.open(type, url);
    xhr0.send();
};

window.xhr_arraybuffer = function (type, url) {
    return new Promise((resolve, reject) => {
        let xhr0 = new XMLHttpRequest();
        xhr0.responseType = "arraybuffer";
        xhr0.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                resolve(this.response);
            }
        };
        xhr0.open(type,"/Scan2CAD/" + url, true);
        xhr0.send();
    });
};
