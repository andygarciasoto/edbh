
export function getUnavailableParameters(params: any): any[] {
    let parameters: any[] = [];
    if (params.site_id)
        parameters.push('U.site_id = ' + params.site_id);
    if (params.unavailable_id)
        parameters.push('U.unavailable_id = ' + params.unavailable_id);
    if (params.asset_id)
        parameters.push('U.asset_id = ' + params.asset_id);
    if (params.shift_id && params.shift_id !== 'All')
        parameters.push('S.shift_id = ' + params.shift_id);
    if (params.status && params.status !== 'All')
        parameters.push(`U.status = '${params.status}'`);
    return parameters;
}