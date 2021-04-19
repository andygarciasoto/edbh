
export function getReasonParameters(params: any): any[] {
    let parameters: any[] = [];
    if (params.dtreason_id)
        parameters.push('DT.dtreason_id = ' + params.dtreason_id);
    if (params.asset_id)
        parameters.push('DT.asset_id = ' + params.asset_id);
    if (params.site_id)
        parameters.push('DT.site_id = ' + params.site_id);
    if (params.status && params.status !== 'All')
        parameters.push(`DT.status = '${params.status}'`);
    if (params.category && params.category !== 'All')
        parameters.push(`DT.dtreason_category = '${params.category}'`);
    if (params.type && params.type !== 'All')
        parameters.push(`DT.type = '${params.type}'`);
    return parameters;
}