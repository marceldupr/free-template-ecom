/**
 * Aurora Studio SDK - Fluent API for custom front-ends and storefronts.
 * Use with X-Api-Key authentication.
 */
function buildQuery(params) {
    if (!params)
        return "";
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== "") {
            search.set(k, String(v));
        }
    }
    const s = search.toString();
    return s ? `?${s}` : "";
}
async function request(baseUrl, apiKey, method, path, opts) {
    const url = `${baseUrl.replace(/\/$/, "")}${path}${buildQuery(opts?.query)}`;
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            "X-Api-Key": apiKey,
        },
        body: opts?.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) {
        const errBody = await res.text();
        let msg;
        try {
            const j = JSON.parse(errBody);
            msg = j?.error ?? errBody ?? res.statusText;
        }
        catch {
            msg = errBody || res.statusText;
        }
        throw new Error(`Aurora API ${res.status}: ${msg}`);
    }
    if (res.status === 204)
        return undefined;
    return res.json();
}
export class AuroraClient {
    baseUrl;
    apiKey;
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/$/, "");
        this.apiKey = options.apiKey;
    }
    req(method, path, opts) {
        return request(this.baseUrl, this.apiKey, method, path, opts);
    }
    tables = Object.assign((slug) => ({
        records: {
            list: (opts) => this.req("GET", `/v1/tables/${slug}/records`, { query: opts }),
            get: (id) => this.req("GET", `/v1/tables/${slug}/records/${id}`),
            create: (data) => this.req("POST", `/v1/tables/${slug}/records`, { body: data }),
            update: (id, data) => this.req("PATCH", `/v1/tables/${slug}/records/${id}`, {
                body: data,
            }),
            delete: (id) => this.req("DELETE", `/v1/tables/${slug}/records/${id}`),
        },
        sectionViews: {
            list: () => this.req("GET", `/v1/tables/${slug}/views`),
        },
    }), {
        list: () => this.req("GET", "/v1/tables"),
    });
    views = Object.assign((slug) => ({
        data: () => this.req("GET", `/v1/views/${slug}/data`),
    }), { list: () => this.req("GET", "/v1/views") });
    reports = Object.assign((id) => ({
        data: () => this.req("GET", `/v1/reports/${id}/data`),
    }), {
        list: () => this.req("GET", "/v1/reports"),
    });
    store = {
        config: () => this.req("GET", "/v1/store/config"),
        pages: {
            list: () => this.req("GET", "/v1/store/pages"),
            get: (slug) => this.req("GET", `/v1/store/pages/${slug}`),
        },
    };
}
