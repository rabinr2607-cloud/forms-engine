import { InjectionToken } from '@angular/core';

export interface AppEnvironment {
    serverDateFormat: string;
    serverDateTimeFormat: string;
    dateViewFormat: string;
    dateTimeViewFormat: string;
    [key: string]: any;
}

export interface AppSetting {
    environment: AppEnvironment;
}

export const APP_SETTING = new InjectionToken<AppSetting>('APP_SETTING', {
    providedIn: 'root',
    factory: () => ({
        environment: {
            serverDateFormat: 'yyyy-MM-dd',
            serverDateTimeFormat: 'yyyy-MM-dd HH:mm:ss',
            dateViewFormat: 'dd MMM yyyy',
            dateTimeViewFormat: 'dd MMM yyyy hh:mm:a',
        }
    })
});