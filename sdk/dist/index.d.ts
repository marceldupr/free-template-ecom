/**
 * Aurora Studio SDK - Fluent API for custom front-ends and storefronts.
 * Use with X-Api-Key authentication.
 */
export interface AuroraClientOptions {
    baseUrl: string;
    apiKey: string;
}
export declare class AuroraClient {
    private baseUrl;
    private apiKey;
    constructor(options: AuroraClientOptions);
    private req;
    tables: ((slug: string) => {
        records: {
            list: (opts?: {
                limit?: number;
                offset?: number;
                sort?: string;
                order?: "asc" | "desc";
                filter?: string;
            }) => Promise<{
                data: Record<string, unknown>[];
                total: number;
                limit: number;
                offset: number;
            }>;
            get: (id: string) => Promise<Record<string, unknown>>;
            create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
            update: (id: string, data: Record<string, unknown>) => Promise<Record<string, unknown>>;
            delete: (id: string) => Promise<void>;
        };
        sectionViews: {
            list: () => Promise<{
                id: string;
                name: string;
                view_type: string;
                config: unknown;
            }[]>;
        };
    }) & {
        list: () => Promise<{
            slug: string;
            name: string;
        }[]>;
    };
    views: ((slug: string) => {
        data: () => Promise<{
            data: unknown[];
        }>;
    }) & {
        list: () => Promise<{
            slug: string;
            name: string;
        }[]>;
    };
    reports: ((id: string) => {
        data: () => Promise<{
            data: unknown[];
        }>;
    }) & {
        list: () => Promise<{
            id: string;
            name: string;
            description?: string;
            config: unknown;
        }[]>;
    };
    store: {
        config: () => Promise<{
            enabled: boolean;
            catalogTableSlug?: string;
            displayField?: string;
            listFields?: string[];
            detailFields?: string[];
            groupingFields?: string[];
            branding?: {
                name: string;
                logo_url?: string;
                accent_color?: string;
                show_powered_by?: boolean;
            };
            theme?: {
                primaryColor?: string;
                fontFamily?: string;
                spacingScale?: string;
            };
        }>;
        pages: {
            list: () => Promise<{
                slug: string;
                name: string;
            }[]>;
            get: (slug: string) => Promise<{
                slug: string;
                name: string;
                blocks: unknown[];
            }>;
        };
    };
}
//# sourceMappingURL=index.d.ts.map