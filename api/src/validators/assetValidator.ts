
export function getAssetParameters(params: any): any[] {
    let parameters: any[] = [];
    if (params.asset_id)
        parameters.push('A.asset_id = ' + params.asset_id);
    if (params.site_id)
        parameters.push('A2.asset_id = ' + params.site_id);
    if (params.status && params.status !== 'All')
        parameters.push(`A.status = '${params.status}'`);
    return parameters;
}