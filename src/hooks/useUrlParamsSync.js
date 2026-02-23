import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

const parseQueryString = (qs) => {
    if (!qs) return [];
    return qs.split('&').map(pair => {
        const index = pair.indexOf('=');
        if (index === -1) return { key: pair, value: '' }; 
        return { 
            key: pair.substring(0, index), 
            value: pair.substring(index + 1) 
        };
    }).filter(p => p.key); 
};

// Build query string from active params
const buildQueryString = (params) => {
    return params
        .filter(p => p.active && p.key) // Only active params with actual keys
        .map(p => `${p.key}=${p.value || ''}`)
        .join('&');
};

export function useUrlParamsSync(activeId) {
    const store = useAppStore();
    const reqState = store.requestStates[activeId];
    
    const lastUrlRef = useRef(reqState?.config?.url || '');
    const lastParamsRef = useRef(JSON.stringify(reqState?.config?.params || []));

    useEffect(() => {
        if (!reqState?.config) return;

        const currentUrl = reqState.config.url || '';
        const currentParams = reqState.config.params || [];
        const currentParamsStr = JSON.stringify(currentParams);

        // ==========================================
        // SCENARIO 1: User typed in the URL Bar
        // ==========================================
        if (currentUrl !== lastUrlRef.current) {
            lastUrlRef.current = currentUrl;
            
            // Split URL safely (handles URLs that have '?' in their query values)
            const [baseUrl, ...qsParts] = currentUrl.split('?');
            const queryString = qsParts.join('?'); 
            
            const parsedPairs = parseQueryString(queryString);
            const inactiveParams = currentParams.filter(p => !p.active);
            
            const newParams = [];
            
            // 1. Add pairs from URL (preserve existing descriptions if they match)
            parsedPairs.forEach(pair => {
                const existing = currentParams.find(p => p.active && p.key === pair.key);
                newParams.push({
                    key: pair.key,
                    value: pair.value,
                    active: true,
                    description: existing?.description || '',
                    valueType: existing?.valueType || 'text'
                });
            });

            // 2. Append inactive params (they shouldn't be deleted just because they aren't in the URL)
            const finalParams = [...newParams, ...inactiveParams];
            
            // 3. Always ensure there is an empty row at the bottom for UX
            if (finalParams.length === 0 || finalParams[finalParams.length - 1].key !== '') {
                finalParams.push({ key: '', value: '', active: true, valueType: 'text', description: '' });
            }

            const finalParamsStr = JSON.stringify(finalParams);
            
            if (currentParamsStr !== finalParamsStr) {
                lastParamsRef.current = finalParamsStr;
                // Update Zustand deep state
                store.updateActiveRequestDeep(['config', 'params'], finalParams);
            }
        } 
        // ==========================================
        // SCENARIO 2: User typed in the Params Table
        // ==========================================
        else if (currentParamsStr !== lastParamsRef.current) {
            lastParamsRef.current = currentParamsStr;
            
            const [baseUrl] = currentUrl.split('?');
            const newQs = buildQueryString(currentParams);
            
            // Construct new URL. If no active params, remove the '?' entirely.
            const newUrl = newQs ? `${baseUrl}?${newQs}` : baseUrl;
            
            if (currentUrl !== newUrl) {
                lastUrlRef.current = newUrl;
                store.updateActiveRequest('url', newUrl);
            }
        }

    }, [reqState?.config?.url, reqState?.config?.params, store]);
}