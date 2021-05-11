
export function getAssetParameters(params: any): any[] {
    let parameters: any[] = [];
    if (params.asset_id)
        parameters.push('A.asset_id = ' + params.asset_id);
    if (params.site_id)
        parameters.push('A2.asset_id = ' + params.site_id);
    if (params.status && params.status !== 'All')
        parameters.push(`A.status = '${params.status}'`);
    if (params.asset_level && params.asset_level !== 'All')
        parameters.push(`A.asset_level = '${params.asset_level}'`);
    if (params.automation_level && params.automation_level !== 'All')
        parameters.push(`A.automation_level = '${params.automation_level}'`);
    return parameters;
}