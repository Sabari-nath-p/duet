export declare enum AnalyticsPeriod {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY"
}
export declare class GetAnalyticsDto {
    startDate?: string;
    endDate?: string;
    period?: AnalyticsPeriod;
    templateId?: string;
}
