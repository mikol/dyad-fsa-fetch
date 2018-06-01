"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Dyad = require("dyad");
var flux_standard_action_1 = require("flux-standard-action");
var store = Dyad.getInstance();
function middleware(action, next) {
    if (flux_standard_action_1.isFSA(action)) {
        var type = action.type, _a = action.meta, _b = _a === void 0 ? {} : _a, _c = _b.fetch, decode_1 = _c === void 0 ? '' : _c, meta = __rest(_b, ["fetch"]), payload = action.payload;
        if (decode_1) {
            if (!payload) {
                throw new Error("Action '" + type + "' missing fetch `payload` object");
            }
            var url = payload.url, options = __rest(payload, ["url"]);
            if (!url) {
                throw new Error("Action '" + type + "' missing fetch `payload.url` property");
            }
            var promise = fetch(url, options).then(function (response) {
                var ok = response.ok, status = response.status, statusText = response.statusText;
                if (!ok) {
                    return response.text().then(function (body) {
                        throw new Error("" + status + (statusText ? ": " + statusText : '') + "\n" + body.trim() + "\n");
                    });
                }
                var nextPayload = {
                    body: response.body,
                    bodyUsed: response.bodyUsed,
                    headers: response.headers,
                    ok: ok,
                    redirected: response.redirected,
                    status: status,
                    statusText: statusText,
                    type: response.type,
                    url: response.url
                };
                if (decode_1 === 'raw') {
                    // `{fetch: 'raw'}` -- Return a `ReadableStream` of the response body.
                    return nextPayload;
                }
                // `{fetch: 'arrayBuffer'}`, `{fetch: 'blob'}`, `{fetch: 'formData'}`,
                // `{fetch: 'json'}`, `{fetch: 'text'}`, ... -- Return a promise that
                // resolves to the result of parsing the response body.
                return response[decode_1]().then(function (value) {
                    nextPayload.value = value;
                    return nextPayload;
                });
            });
            return store.dispatch({ type: type, meta: meta, payload: promise });
        }
    }
    return next(action);
}
exports.middleware = middleware;
