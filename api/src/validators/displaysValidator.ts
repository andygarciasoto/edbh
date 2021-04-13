
export function getDisplaysParameters(params: any): any[] {
    let parameters: any[] = [];
    if (params.assetdisplaysystem_id)
        parameters.push('AD.assetdisplaysystem_id = ' + params.assetdisplaysystem_id);
    if (params.site_id)
        parameters.push('AD.site_id = ' + params.site_id);
    if (params.status && params.status !== 'All')
        parameters.push(`AD.status = '${params.status}'`);
    return parameters;
}